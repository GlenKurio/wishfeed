import { updateProfile, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "..";
import type {
  DbUserProfile,
  FollowerFollowingInfo,
  UserProfile,
} from "@/lib/types";
import { auth } from "../auth";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../storage";

export async function createUserProfile(user: User) {
  if (!user || !user.email) {
    console.log("NO USER");
    return;
  }
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    console.log("USER EXISTS");
    return;
  }

  const userData: DbUserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    bio: "",
    birthday: "",
    isPublic: true,
    handle: user.email?.split("@")[0],
    updatedAt: serverTimestamp(),
    followersCount: 0,
    followingCount: 0,
    followRequestsSentCount: 0,
    followRequestsReceivedCount: 0,
    postsCount: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  console.log("SUCCESS");
  return;
}

export async function getUserProfileById({
  userId,
}: {
  userId: string;
}): Promise<UserProfile | null> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to get user profile.");
  }
  const userDocRef = doc(db, "users", userId);
  const userSnap = await getDoc(userDocRef);

  let userProfile = null;
  if (userSnap.exists()) {
    userProfile = userSnap.data() as UserProfile;
  }

  return userProfile;
}

export async function editUserProfile({
  updatedUserProfile,
  oldPhotoURL,
}: {
  updatedUserProfile: UserProfile;
  oldPhotoURL?: string | null;
}) {
  const user = auth.currentUser;

  if (!user || user.uid !== updatedUserProfile.uid) {
    throw new Error("You are not authorized to perform this action.");
  }

  let deleteImagePromise: Promise<void> | null = null;

  //  Use the passed-in oldPhotoURL to check if deletion is needed
  if (oldPhotoURL && oldPhotoURL !== updatedUserProfile.photoURL) {
    // Safety check: only delete images from our own storage
    if (oldPhotoURL.includes("firebasestorage.googleapis.com")) {
      try {
        const oldImageRef = ref(storage, oldPhotoURL);
        deleteImagePromise = deleteObject(oldImageRef);
      } catch (error) {
        console.error("Could not create reference to old avatar:", error);
      }
    }
  }

  // 4. Concurrently run all update and delete operations
  try {
    const authUpdatePromise = updateProfile(user, {
      displayName: updatedUserProfile.displayName,
      photoURL: updatedUserProfile.photoURL,
    });

    const userProfileDocRef = doc(db, "users", updatedUserProfile.uid);
    const firestoreUpdatePromise = updateDoc(userProfileDocRef, {
      ...updatedUserProfile, // Pass the whole object to update all fields
    });

    const allPromises: Promise<void>[] = [
      authUpdatePromise,
      firestoreUpdatePromise,
    ];
    if (deleteImagePromise) {
      allPromises.push(
        deleteImagePromise.catch((err) => {
          console.warn(
            "Old avatar deletion failed, but profile update succeeded:",
            err,
          );
        }),
      );
    }

    await Promise.all(allPromises);
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw new Error("An error occurred while updating the profile.");
  }
}

/**
 * Validates if a handle is available (not taken by another user)
 * @param handle - The handle to validate
 * @param currentUserHandle - The current user's handle (to allow keeping their own handle)
 * @returns true if handle is available, false if taken
 */
export async function validateHandle(
  handle: string,
  currentUserProfile: UserProfile,
): Promise<boolean> {
  try {
    const user = auth.currentUser;

    if (!user || user.uid !== currentUserProfile.uid) {
      throw new Error("Must be logged in to update a profile.");
    }

    const currentUserHandle = currentUserProfile.handle;
    // If user is keeping their current handle, it's valid
    if (currentUserHandle && handle === currentUserHandle) {
      return true;
    }

    // Normalize handle (trim, lowercase for case-insensitive check)
    const normalizedHandle = handle.trim().toLowerCase();

    // Query Firestore for existing handles
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("handle", "==", normalizedHandle), // Store lowercase version for querying
    );

    const querySnapshot = await getDocs(q);

    // If no documents found, handle is available
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error validating handle:", error);
    // On error, assume handle is taken (fail safe)
    return false;
  }
}

//*******************************
// Follow/Unfollow functionality
// ******************************

// Helper to get user info for subcollection storage
export async function getUserInfoForSubcollection(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }
  const data = userDoc.data();
  return {
    uid: userId,
    displayName: data.displayName,
    handle: data.handle,
    photoURL: data.photoURL || null,
  };
}

// Check if user is following another user
export async function isFollowing(
  currentUserId: string,
  targetUserId: string,
): Promise<boolean> {
  const followingDoc = await getDoc(
    doc(db, "users", currentUserId, "following", targetUserId),
  );
  return followingDoc.exists();
}

// Check if follow request exists
export async function hasFollowRequest(
  currentUserId: string,
  targetUserId: string,
): Promise<boolean> {
  const requestDoc = await getDoc(
    doc(db, "users", currentUserId, "followRequestsSent", targetUserId),
  );
  return requestDoc.exists();
}

export async function followUser(
  currentUserId: string,
  targetUserId: string,
): Promise<void> {
  if (!currentUserId || !targetUserId) {
    throw new Error("User IDs are required");
  }

  if (currentUserId === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  // Get user info first
  const [currentUserInfo, targetUserInfo] = await Promise.all([
    getUserInfoForSubcollection(currentUserId),
    getUserInfoForSubcollection(targetUserId),
  ]);

  await runTransaction(db, async (transaction) => {
    const targetUserRef = doc(db, "users", targetUserId);
    const targetUserDoc = await transaction.get(targetUserRef);

    if (!targetUserDoc.exists()) {
      throw new Error("Target user does not exist");
    }

    const targetUserData = targetUserDoc.data();

    // Check if target user follows current user (allows bypass of privacy)
    const targetFollowsCurrentUserRef = doc(
      db,
      "users",
      targetUserId,
      "following",
      currentUserId,
    );
    const targetFollowsCurrentUserDoc = await transaction.get(
      targetFollowsCurrentUserRef,
    );
    const targetFollowsCurrentUser = targetFollowsCurrentUserDoc.exists();

    // Only allow following private accounts if they already follow you
    if (!targetUserData.isPublic && !targetFollowsCurrentUser) {
      throw new Error(
        "Cannot follow private account directly. They must follow you first or accept your request.",
      );
    }

    // Add to current user's following subcollection
    const followingRef = doc(
      db,
      "users",
      currentUserId,
      "following",
      targetUserId,
    );
    transaction.set(followingRef, {
      ...targetUserInfo,
      followedAt: serverTimestamp(),
    });

    // Add to target user's followers subcollection
    const followerRef = doc(
      db,
      "users",
      targetUserId,
      "followers",
      currentUserId,
    );
    transaction.set(followerRef, {
      ...currentUserInfo,
      followedAt: serverTimestamp(),
    });

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);
    transaction.update(currentUserRef, {
      followingCount: increment(1),
    });

    transaction.update(targetUserRef, {
      followersCount: increment(1),
    });
  });

  // Create notification
  try {
    await addDoc(collection(db, "notifications"), {
      userId: targetUserId,
      type: "follow",
      actorId: currentUserId,
      actorName: currentUserInfo.displayName,
      actorPhotoURL: currentUserInfo.photoURL,
      message: `${currentUserInfo.displayName} started following you`,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }

  // Create notification
  try {
    await addDoc(collection(db, "notifications"), {
      userId: targetUserId,
      type: "follow",
      actorId: currentUserId,
      actorName: currentUserInfo.displayName,
      actorPhotoURL: currentUserInfo.photoURL,
      message: `${currentUserInfo.displayName} started following you`,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Unfollow user
export async function unfollowUser(
  currentUserId: string,
  targetUserId: string,
): Promise<void> {
  if (!currentUserId || !targetUserId) {
    throw new Error("User IDs are required");
  }

  await runTransaction(db, async (transaction) => {
    // Remove from subcollections
    const followingRef = doc(
      db,
      "users",
      currentUserId,
      "following",
      targetUserId,
    );
    const followerRef = doc(
      db,
      "users",
      targetUserId,
      "followers",
      currentUserId,
    );

    transaction.delete(followingRef);
    transaction.delete(followerRef);

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    transaction.update(currentUserRef, {
      followingCount: increment(-1),
    });

    transaction.update(targetUserRef, {
      followersCount: increment(-1),
    });
  });
}

// Send follow request to private account
export async function sendFollowRequest(
  currentUserId: string,
  targetUserId: string,
): Promise<void> {
  if (!currentUserId || !targetUserId) {
    throw new Error("User IDs are required");
  }

  if (currentUserId === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  const [currentUserInfo, targetUserInfo] = await Promise.all([
    getUserInfoForSubcollection(currentUserId),
    getUserInfoForSubcollection(targetUserId),
  ]);

  await runTransaction(db, async (transaction) => {
    const targetUserRef = doc(db, "users", targetUserId);
    const targetUserDoc = await transaction.get(targetUserRef);

    if (!targetUserDoc.exists()) {
      throw new Error("Target user does not exist");
    }

    const targetUserData = targetUserDoc.data();

    if (targetUserData.isPublic) {
      throw new Error("Use followUser for public accounts");
    }

    // Add to current user's followRequestsSent subcollection
    const requestSentRef = doc(
      db,
      "users",
      currentUserId,
      "followRequestsSent",
      targetUserId,
    );
    transaction.set(requestSentRef, {
      ...targetUserInfo,
      requestedAt: serverTimestamp(),
    });

    // Add to target user's followRequestsReceived subcollection
    const requestReceivedRef = doc(
      db,
      "users",
      targetUserId,
      "followRequestsReceived",
      currentUserId,
    );
    transaction.set(requestReceivedRef, {
      ...currentUserInfo,
      requestedAt: serverTimestamp(),
    });

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);
    transaction.update(currentUserRef, {
      followRequestsSentCount: increment(1),
    });

    transaction.update(targetUserRef, {
      followRequestsReceivedCount: increment(1),
    });
  });

  // Create notification
  try {
    await addDoc(collection(db, "notifications"), {
      userId: targetUserId,
      type: "follow_request",
      actorId: currentUserId,
      actorName: currentUserInfo.displayName,
      actorPhotoURL: currentUserInfo.photoURL,
      message: `${currentUserInfo.displayName} requested to follow you`,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Cancel follow request
export async function cancelFollowRequest(
  currentUserId: string,
  targetUserId: string,
): Promise<void> {
  if (!currentUserId || !targetUserId) {
    throw new Error("User IDs are required");
  }

  await runTransaction(db, async (transaction) => {
    // Remove from subcollections
    const requestSentRef = doc(
      db,
      "users",
      currentUserId,
      "followRequestsSent",
      targetUserId,
    );
    const requestReceivedRef = doc(
      db,
      "users",
      targetUserId,
      "followRequestsReceived",
      currentUserId,
    );

    transaction.delete(requestSentRef);
    transaction.delete(requestReceivedRef);

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    transaction.update(currentUserRef, {
      followRequestsSentCount: increment(-1),
    });

    transaction.update(targetUserRef, {
      followRequestsReceivedCount: increment(-1),
    });
  });

  // Delete notification
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", targetUserId),
      where("actorId", "==", currentUserId),
      where("type", "==", "follow_request"),
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

// Accept follow request
export async function acceptFollowRequest(
  currentUserId: string,
  requesterId: string,
): Promise<void> {
  if (!currentUserId || !requesterId) {
    throw new Error("User IDs are required");
  }

  const [currentUserInfo, requesterInfo] = await Promise.all([
    getUserInfoForSubcollection(currentUserId),
    getUserInfoForSubcollection(requesterId),
  ]);

  await runTransaction(db, async (transaction) => {
    const requesterRef = doc(db, "users", requesterId);
    const requesterDoc = await transaction.get(requesterRef);

    if (!requesterDoc.exists()) {
      throw new Error("Requester does not exist");
    }

    // Remove from follow requests subcollections
    const requestSentRef = doc(
      db,
      "users",
      requesterId,
      "followRequestsSent",
      currentUserId,
    );
    const requestReceivedRef = doc(
      db,
      "users",
      currentUserId,
      "followRequestsReceived",
      requesterId,
    );

    transaction.delete(requestSentRef);
    transaction.delete(requestReceivedRef);

    // Add to following/followers subcollections
    const followingRef = doc(
      db,
      "users",
      requesterId,
      "following",
      currentUserId,
    );
    transaction.set(followingRef, {
      ...currentUserInfo,
      followedAt: serverTimestamp(),
    });

    const followerRef = doc(
      db,
      "users",
      currentUserId,
      "followers",
      requesterId,
    );
    transaction.set(followerRef, {
      ...requesterInfo,
      followedAt: serverTimestamp(),
    });

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);

    transaction.update(currentUserRef, {
      followRequestsReceivedCount: increment(-1),
      followersCount: increment(1),
    });

    transaction.update(requesterRef, {
      followRequestsSentCount: increment(-1),
      followingCount: increment(1),
    });
  });

  // Handle notifications
  try {
    // Delete the request notification
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", currentUserId),
      where("actorId", "==", requesterId),
      where("type", "==", "follow_request"),
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Send acceptance notification
    await addDoc(collection(db, "notifications"), {
      userId: requesterId,
      type: "follow_request_accepted",
      actorId: currentUserId,
      actorName: currentUserInfo.displayName,
      actorPhotoURL: currentUserInfo.photoURL,
      message: `${currentUserInfo.displayName} accepted your follow request`,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error handling notifications:", error);
  }
}
// Reject follow request
export async function rejectFollowRequest(
  currentUserId: string,
  requesterId: string,
): Promise<void> {
  if (!currentUserId || !requesterId) {
    throw new Error("User IDs are required");
  }

  await runTransaction(db, async (transaction) => {
    // Remove from subcollections
    const requestSentRef = doc(
      db,
      "users",
      requesterId,
      "followRequestsSent",
      currentUserId,
    );
    const requestReceivedRef = doc(
      db,
      "users",
      currentUserId,
      "followRequestsReceived",
      requesterId,
    );

    transaction.delete(requestSentRef);
    transaction.delete(requestReceivedRef);

    // Update counters
    const currentUserRef = doc(db, "users", currentUserId);
    const requesterRef = doc(db, "users", requesterId);

    transaction.update(currentUserRef, {
      followRequestsReceivedCount: increment(-1),
    });

    transaction.update(requesterRef, {
      followRequestsSentCount: increment(-1),
    });
  });

  // Delete notification
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", currentUserId),
      where("actorId", "==", requesterId),
      where("type", "==", "follow_request"),
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

// Check if a user has sent you a follow request
export async function hasIncomingFollowRequest(
  currentUserId: string,
  requesterId: string,
): Promise<boolean> {
  const requestDoc = await getDoc(
    doc(db, "users", currentUserId, "followRequestsReceived", requesterId),
  );
  return requestDoc.exists();
}

export interface PaginatedFollowersResult {
  followers: FollowerFollowingInfo[];
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Searches and paginates through a user's followers subcollection.
 */
export async function getUserFollowers({
  userId,
  pageSize = 30,
  lastDoc,
}: {
  userId: string;

  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}): Promise<PaginatedFollowersResult> {
  // Get a reference to the followers subcollection
  const followersRef = collection(db, "users", userId, "followers");

  const queryConstraints: QueryConstraint[] = [
    orderBy("displayName"), // You MUST order by the field you are filtering
    limit(pageSize + 1), // Fetch one extra to check if there are more pages
  ];

  // If this is not the first page, start after the last document
  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const q = query(followersRef, ...queryConstraints);
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;

  const hasMore = docs.length > pageSize;
  const followers = docs
    .slice(0, pageSize)
    .map((doc) => doc.data() as FollowerFollowingInfo);

  return {
    followers,
    lastDoc: hasMore ? docs[pageSize - 1] : null,
    hasMore,
  };
}

export interface PaginatedFollowingResult {
  following: FollowerFollowingInfo[];
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Searches and paginates through a user's following subcollection.
 */
export async function getUserFollowing({
  userId,
  pageSize = 30,
  lastDoc,
}: {
  userId: string;

  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}): Promise<PaginatedFollowingResult> {
  // Get a reference to the followers subcollection
  const followingRef = collection(db, "users", userId, "following");

  const queryConstraints: QueryConstraint[] = [
    orderBy("displayName"), // You MUST order by the field you are filtering
    limit(pageSize + 1), // Fetch one extra to check if there are more pages
  ];

  // If this is not the first page, start after the last document
  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const q = query(followingRef, ...queryConstraints);
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;

  const hasMore = docs.length > pageSize;
  const following = docs
    .slice(0, pageSize)
    .map((doc) => doc.data() as FollowerFollowingInfo);

  return {
    following,
    lastDoc: hasMore ? docs[pageSize - 1] : null,
    hasMore,
  };
}
