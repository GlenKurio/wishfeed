import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  type DeliveryMethod,
  type GiftType,
  type GiftTypeWrite,
  type PostGiftFields,
  type PostType,
} from "../../types";

import { db } from "..";
import { auth } from "../auth";

export interface ReserveGiftOptions {
  deliveryMethod: DeliveryMethod;
  giftMessage?: string;
  isAnonymous?: boolean;
}

/**
 * Reserve a gift for a post
 * @param postId - The ID of the post to gift
 * @param post - The full post object (for denormalization)
 * @param options - Reservation options including delivery method
 * @returns The created gift document
 */
export async function reserveGift(
  postId: string,
  post: PostType,
  options: ReserveGiftOptions,
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to reserve a gift");
  }

  if (user.uid === post.author.uid) {
    throw new Error("You cannot gift your own post");
  }

  if (post.gift.giftStatus !== "available") {
    throw new Error("This gift is already reserved or gifted");
  }

  const giftId = `${postId}_${user.uid}`;
  const giftRef = doc(db, "gifts", giftId);
  const postRef = doc(db, "posts", postId);

  // Check if gift already exists
  const existingGift = await getDoc(giftRef);
  // if (existingGift.exists() && existingGift.data().status === "reserved") {
  //   throw new Error("You have already reserved this gift");
  // }

  // Get current user's profile for denormalization
  const userProfileRef = doc(db, "users", user.uid);
  const userProfileSnap = await getDoc(userProfileRef);

  if (!userProfileSnap.exists()) {
    throw new Error("User profile not found");
  }

  const userData = userProfileSnap.data();

  // Use batch write for atomicity
  const batch = writeBatch(db);

  const newGift: GiftTypeWrite = {
    id: giftId,
    postId: postId,
    gifterId: user.uid,
    recipientId: post.author.uid,

    // Denormalized post info
    post: {
      title: post.title,
      image: post.image,
      brand: post.brand,
      price: post.price,
      url: post.wishUrlAffiliate,
    },

    // Denormalized user info
    gifter: {
      uid: user.uid,
      photoUrl: userData.photoURL || undefined,
      displayName: userData.displayName || "Anonymous",
      handle: userData.handle || user.uid,
    },

    recipient: {
      uid: post.author.uid,
      photoUrl: post.author.photoUrl,
      displayName: post.author.displayName,
      handle: post.author.handle,
    },

    // Core status
    status: "reserved",
    deliveryMethod: options.deliveryMethod,

    // Timestamps
    reservedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    ),

    // Optional message
    giftMessage: options.giftMessage || null,

    // Privacy settings
    isAnonymous: options.isAnonymous ?? false,

    // Initialize reminders
    reminders: {
      sendReminderAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      ),
      expirationWarningAt: Timestamp.fromDate(
        new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now (5 days before expiry)
      ),
    },

    // Metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Create gift document
  batch.set(giftRef, newGift);

  // Update post with reservation
  batch.update(postRef, {
    gift: {
      giftId,
      giftStatus: "reserved",
      deliveryMethod: options.deliveryMethod,
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ),

      gifter: {
        uid: user.uid,
        photoUrl: userData.photoURL || undefined,
        displayName: userData.displayName || "Anonymous",
        handle: userData.handle,
      },
    } as PostGiftFields,

    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return { ...newGift, id: giftId };
}
/**
 * Mark a gift as sent by the gifter
 * @param giftId - The ID of the gift document
 * @param trackingInfo - Optional tracking information
 * @param messageToRecipient - Optional message to the recipient
 */
export async function markGiftAsSent(
  giftId: string,
  options?: {
    trackingInfo: string;
    messageToRecipient: string;
    deliveryMethod: DeliveryMethod;
  },
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to mark gift as sent");
  }

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    throw new Error("Gift not found");
  }

  const giftData = giftSnap.data();

  if (giftData.gifterId !== user.uid) {
    throw new Error("Only the gifter can mark the gift as sent");
  }

  if (giftData.status !== "reserved") {
    throw new Error("Gift must be in reserved status to mark as sent");
  }

  const postRef = doc(db, "posts", giftData.postId);

  const batch = writeBatch(db);

  // Update gift document
  batch.update(giftRef, {
    status: "sent",
    sentAt: serverTimestamp(),
    trackingInfo: options?.trackingInfo,

    messageToRecipient: options?.messageToRecipient,

    deliveryMethod: options?.deliveryMethod,

    updatedAt: serverTimestamp(),
  });

  // Update post status (keep as reserved or change to gifted - your choice)
  batch.update(postRef, {
    giftStatus: "sent", // Or "gifted" if you want to change it now
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // TODO: Trigger notification to recipient
  // "Your gift has been sent! Confirm when you receive it."

  return { success: true };
}

/**
 * Confirm receipt of a gift by the recipient
 * @param giftId - The ID of the gift document
 * @param recipientNotes - Optional thank you message
 */
export async function confirmGiftReceipt(
  giftId: string,
  recipientNotes?: string,
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to confirm gift receipt");
  }

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    throw new Error("Gift not found");
  }

  const giftData = giftSnap.data();

  if (giftData.recipientId !== user.uid) {
    throw new Error("Only the recipient can confirm gift receipt");
  }

  if (giftData.status !== "sent" && giftData.status !== "reserved") {
    throw new Error("Gift must be sent before it can be confirmed");
  }

  const postRef = doc(db, "posts", giftData.postId);

  const batch = writeBatch(db);

  // Update gift document
  batch.update(giftRef, {
    status: "confirmed",
    confirmedAt: serverTimestamp(),
    ...(recipientNotes && { recipientNotes }),
    updatedAt: serverTimestamp(),
  });

  // Update post to gifted status and reveal gifter
  batch.update(postRef, {
    giftStatus: "gifted",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // TODO: This is where you'd trigger Cloud Function to:
  // 1. Update userStats for both gifter and recipient
  // 2. Update userGifters collection
  // 3. Send notification to gifter "Your gift was confirmed!"

  return { success: true };
}

/**
 * Cancel a gift reservation
 * @param giftId - The ID of the gift document
 */
export async function cancelGiftReservation(giftId: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to cancel reservation");
  }

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    throw new Error("Gift not found");
  }

  const giftData = giftSnap.data();

  if (giftData.gifterId !== user.uid) {
    throw new Error("Only the gifter can cancel the reservation");
  }

  if (giftData.status === "confirmed") {
    throw new Error("Cannot cancel a confirmed gift");
  }

  const postRef = doc(db, "posts", giftData.postId);

  const batch = writeBatch(db);

  // Update gift to cancelled status (or delete it)
  batch.delete(giftRef);

  // Return post to available status
  batch.update(postRef, {
    gift: {
      giftStatus: "available",
      gifter: null, // Remove gifter info
    },
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return { success: true };
}

/**
 * Revert a gift from "sent" back to "reserved"
 * Allows gifter to undo marking gift as sent
 */
export async function revertGiftToReserved(giftId: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to revert gift status");
  }

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    throw new Error("Gift not found");
  }

  const giftData = giftSnap.data();

  if (giftData.gifterId !== user.uid) {
    throw new Error("Only the gifter can revert the gift status");
  }

  if (giftData.status !== "sent") {
    throw new Error("Can only revert gifts that are marked as sent");
  }

  const postRef = doc(db, "posts", giftData.postId);

  const batch = writeBatch(db);

  // Revert gift to reserved
  batch.update(giftRef, {
    status: "reserved",
    sentAt: null,
    trackingInfo: null,
    messageToRecipient: null,
    deliveryMethod: null,
    updatedAt: serverTimestamp(),
  });

  // Keep post as reserved
  batch.update(postRef, {
    giftStatus: "reserved",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return { success: true };
}

/**
 * Revert a gift from "confirmed" back to "sent"
 * Allows recipient to undo confirmation (within a time window)
 */
export async function revertGiftToSent(giftId: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to revert gift confirmation");
  }

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    throw new Error("Gift not found");
  }

  const giftData = giftSnap.data();

  if (giftData.recipientId !== user.uid) {
    throw new Error("Only the recipient can revert gift confirmation");
  }

  if (giftData.status !== "confirmed") {
    throw new Error("Can only revert confirmed gifts");
  }

  // Optional: Add time limit for reverting (e.g., 24 hours)
  const confirmedAt = giftData.confirmedAt?.toMillis();
  const now = Date.now();
  const hoursSinceConfirmation = (now - confirmedAt) / (1000 * 60 * 60);

  if (hoursSinceConfirmation > 24) {
    throw new Error("Cannot revert confirmation after 24 hours");
  }

  const postRef = doc(db, "posts", giftData.postId);

  const batch = writeBatch(db);

  // Revert gift to sent
  batch.update(giftRef, {
    status: "sent",
    confirmedAt: null,
    recipientNotes: null,
    updatedAt: serverTimestamp(),
  });

  // Keep post as reserved (or gifted, depending on your preference)
  batch.update(postRef, {
    giftStatus: "sent",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Note: You'll need a Cloud Function to revert any stats that were updated
  // when the gift was confirmed (userStats, userGifters, etc.)

  return { success: true };
}

/**
 * Get gift details for a post
 * @param postId - The ID of the post
 * @param gifterId - Optional: specific gifter ID to look up
 */
export async function getGiftForPost(postId: string, gifterId?: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to view gift details");
  }

  const giftId = gifterId ? `${postId}_${gifterId}` : `${postId}_${user.uid}`;

  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    return null;
  }

  const giftData = giftSnap.data();

  // Only allow access if user is gifter or recipient
  if (giftData.gifterId !== user.uid && giftData.recipientId !== user.uid) {
    throw new Error("Unauthorized to view this gift");
  }

  return { id: giftSnap.id, ...giftData };
}

/**
 * Helper function to check if a gift reservation has expired
 * Note: This should ideally run as a Cloud Function scheduled task
 */
export async function checkGiftExpiration(giftId: string) {
  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) {
    return { expired: false };
  }

  const giftData = giftSnap.data();

  if (giftData.status !== "reserved") {
    return { expired: false };
  }

  const now = Timestamp.now();
  const expiresAt = giftData.expiresAt;

  if (expiresAt && expiresAt.toMillis() < now.toMillis()) {
    // Gift has expired - return to available
    const postRef = doc(db, "posts", giftData.postId);

    const batch = writeBatch(db);

    batch.update(giftRef, {
      status: "expired",
      updatedAt: serverTimestamp(),
    });

    batch.update(postRef, {
      giftStatus: "available",
      gifter: null,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return { expired: true };
  }

  return { expired: false };
}

export async function getGiftById({
  postId,
  userId,
}: {
  postId?: string;
  userId?: string;
}) {
  if (!postId || !userId) {
    throw new Error("postId and UserId requried");
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to view gift details");
  }

  if (user.uid !== userId) {
    throw new Error("Must be logged in to view gift details");
  }

  const giftId = `${postId}_${user.uid}`;
  const giftRef = doc(db, "gifts", giftId);
  const giftSnap = await getDoc(giftRef);

  if (!giftSnap.exists()) return null;

  return { id: giftSnap.id, ...giftSnap.data() } as GiftType;
}
