import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
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
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { firebaseApp } from ".";
import {
  createWishlistSchema,
  newWishSchema,
  type CreateWishlist,
  type DbPostType,
  type DbUserProfile,
  type DbWishlist,
  type FollowerFollowingInfo,
  type NewWishType,
  type PostType,
  type UserProfile,
  type Wishlist,
} from "../types";

import { updateProfile, type User } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { auth } from "./auth";
import { storage } from "./storage";
import { swapUrl } from "./functions";

export const db = getFirestore(firebaseApp);

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

export async function saveWishPostToDb(wishData: NewWishType) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to save posts.");
  }
  const validatedData = newWishSchema.parse(wishData);

  // 0. Swap url for affiliate one

  const affiliateLink = await swapUrl(validatedData.wish_url);

  // 1. Get a new write batch
  const batch = writeBatch(db);

  // 2. Create a reference for the new post document in the 'posts' collection
  const newPostRef = doc(collection(db, "posts"));

  // 3. Create a reference to the user's profile document
  const userProfileRef = doc(db, "users", user.uid);
  const userProfileSnap = await getDoc(userProfileRef);
  if (!userProfileSnap.exists()) throw new Error("cannot find user profile");

  const userData = userProfileSnap.data();

  // Construct the final post object, now including the author's UID
  const fullPost: DbPostType = {
    id: newPostRef.id, // Store the auto-generated ID right in the document

    author: {
      uid: userData.uid,
      displayName: userData.displayName,
      photoUrl: userData.photoURL,
      handle: userData.handle,
    },

    image: validatedData.wish_image as string,
    title: validatedData.wish_title,
    description: validatedData.wish_description,
    price: validatedData.wish_price,
    brand: validatedData.brand,
    wishUrlOriginal: validatedData.wish_url,
    wishUrlAffiliate: affiliateLink,
    likesCount: 0,
    repostsCount: 0,
    wishlists: [],

    giftStatus: "available",

    isPublished: validatedData.isPublished,
    ...(validatedData.isPublished
      ? { publishedAt: serverTimestamp() }
      : { publishedAt: null }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 4. In the batch, set the new post document
  batch.set(newPostRef, fullPost);

  // 5. In the batch, update the user's profile to increment the postCount
  // This is an atomic operation that happens on the Firestore server.
  // We no longer need to fetch the user profile first, which saves a read operation.
  if (validatedData.isPublished) {
    batch.update(userProfileRef, {
      postsCount: increment(1),
    });
  }

  // 6. Commit the batch
  await batch.commit();

  // Return the final post object, which now includes its ID
  return fullPost;
}
export async function getFeedPosts() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // 1. Get following list
  const userDocRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) return [];

  const following = userSnap.data().following || [];

  if (following.length === 0) return [];

  // 2. Split following into chunks of 10 (Firestore 'in' limit)
  const chunks = [];
  for (let i = 0; i < following.length; i += 10) {
    chunks.push(following.slice(i, i + 10));
  }

  // 3. Query each chunk in parallel
  const postsRef = collection(db, "posts");
  const queryPromises = chunks.map((chunk) => {
    const q = query(
      postsRef,
      where("userUid", "in", chunk),
      orderBy("createdAt", "desc"),
    );
    return getDocs(q);
  });

  const querySnapshots = await Promise.all(queryPromises);

  // 4. Combine and sort all results
  const allPosts = querySnapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  );

  // Sort by createdAt descending (in case chunks were out of order)
  // allPosts.sort((a, b) => {
  //   const aTime = a.createdAt?.toMillis?.() || 0;
  //   const bTime = b.createdAt?.toMillis?.() || 0;
  //   return bTime - aTime;
  // });

  return allPosts;
}

export interface PaginatedPostsResult {
  posts: PostType[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function getUserPostsPaginated({
  userId,
  published = true,
  pageSize = 10,
  lastDoc,
  wishlist,
}: {
  userId: string;
  published: boolean;
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  wishlist: string;
}): Promise<PaginatedPostsResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to view posts.");
  }
  if (!published && user.uid !== userId) {
    throw new Error("You can only view your own drafts.");
  }
  const postsRef = collection(db, "posts");

  const queryConstraints: QueryConstraint[] = [
    where("author.uid", "==", userId),
    where("isPublished", "==", published),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1),
  ];

  // Add collection filters only if there is collections passed; Otherwise just get all posts;
  if (wishlist !== "all" && wishlist !== "drafts") {
    // Firestore supports up to 10 values
    queryConstraints.push(where("wishlists", "array-contains", wishlist));
  }

  //   let q = query(
  //     postsRef,
  //     where("userUid", "==", userId),
  //     where("isPublished", "==", published),
  //     orderBy("createdAt", "desc"),
  //     limit(pageSize + 1),
  //   );

  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const q = query(postsRef, ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;

  const hasMore = docs.length > pageSize;
  const posts = docs.slice(0, pageSize).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PostType[];

  return {
    posts,
    lastDoc: hasMore ? docs[pageSize - 1] : null,
    hasMore,
  };
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

// export async function editUserProfile({
//   updatedUserProfile,
// }: {
//   updatedUserProfile: UserProfile;
// }) {
//   const user = auth.currentUser;

//   if (!user || user.uid !== updatedUserProfile.uid) {
//     throw new Error("Must be logged in to update a profile.");
//   }

//   // 1. Update Firebase Authentication profile
//   await updateProfile(user, {
//     displayName: updatedUserProfile.displayName,
//     photoURL: updatedUserProfile.photoURL,
//   });

//   // 2. Update the userProfile document in Firestore
//   const userProfileDocRef = doc(db, "users", updatedUserProfile.uid);
//   await updateDoc(userProfileDocRef, updatedUserProfile);
// }

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

// export async function saveWishlistToDb(
//   wishlistData: CreateWishlist,
//   wishlistId?: string,
// ) {
//   const user = auth.currentUser;

//   if (!user) {
//     throw new Error("Must be logged in to create or update a wishlist.");
//   }

//   // Validate the incoming data
//   const validatedData = createWishlistSchema.parse(wishlistData);

//   if (wishlistId) {
//     // If a wishlistId is provided, update the existing wishlist
//     const wishlistRef = doc(db, "wishlists", wishlistId);

//     // Prepare the data for update, ensuring we don't try to update the 'id' or 'owner'
//     const { ...dataToUpdate } = validatedData;
//     const wishlistToUpdate: Partial<
//       Omit<DbWishlist, "id" | "owner" | "createdAt">
//     > = {
//       ...dataToUpdate,
//       updatedAt: serverTimestamp(),
//     };

//     await updateDoc(wishlistRef, wishlistToUpdate);
//     return { message: "updated" };
//   } else {
//     // If no wishlistId is provided, create a new wishlist

//     // 1. Create a reference for a new document to get its auto-generated ID
//     const newWishlistRef = doc(collection(db, "wishlists"));

//     // 2. Include the new document's ID in the object you're creating
//     const newWishlist: DbWishlist = {
//       id: newWishlistRef.id, // Assign the generated ID here
//       ...validatedData,
//       owner: user.uid,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     // 3. Use setDoc to save the complete object to the new document reference
//     await setDoc(newWishlistRef, newWishlist);
//     return { message: "created" };
//   }
// }

// export async function saveWishlistToDb(
//   wishlistData: CreateWishlist,
//   wishlistId?: string,
//   previousPostIds?: string[], // This is the key optimization
// ): Promise<Wishlist> {
//   const user = auth.currentUser;
//   if (!user) {
//     throw new Error("Must be logged in to create or update a wishlist.");
//   }

//   const validatedData = createWishlistSchema.parse(wishlistData);
//   const newPostIds = validatedData.posts;

//   // 1. Create a single batch for all database operations.
//   const batch = writeBatch(db);
//   let finalWishlistId: string;

//   if (wishlistId && previousPostIds !== undefined) {
//     // --- ATOMIC UPDATE PATH ---
//     finalWishlistId = wishlistId;
//     const wishlistRef = doc(db, "wishlists", wishlistId);

//     // Calculate changes using the passed-in array (no extra read!)
//     const postsToAdd = newPostIds.filter((id) => !previousPostIds.includes(id));
//     const postsToRemove = previousPostIds.filter(
//       (id) => !newPostIds.includes(id),
//     );

//     // Add the wishlist update to the batch
//     const wishlistToUpdate = { ...validatedData, updatedAt: serverTimestamp() };
//     batch.update(wishlistRef, wishlistToUpdate);

//     // Add the "add" post updates to the batch
//     postsToAdd.forEach((postId) => {
//       const postRef = doc(db, "posts", postId);
//       batch.update(postRef, { wishlists: arrayUnion(wishlistId) });
//     });

//     // Add the "remove" post updates to the batch
//     postsToRemove.forEach((postId) => {
//       const postRef = doc(db, "posts", postId);
//       batch.update(postRef, { wishlists: arrayRemove(wishlistId) });
//     });
//   } else {
//     // --- ATOMIC CREATE PATH ---
//     const newWishlistRef = doc(collection(db, "wishlists"));
//     finalWishlistId = newWishlistRef.id;

//     const newWishlist: DbWishlist = {
//       id: finalWishlistId,
//       ...validatedData,
//       owner: user.uid,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     // Add the wishlist creation to the batch
//     batch.set(newWishlistRef, newWishlist);

//     // Add all post updates to the batch
//     newPostIds.forEach((postId) => {
//       const postRef = doc(db, "posts", postId);
//       batch.update(postRef, { wishlists: arrayUnion(finalWishlistId) });
//     });
//   }

//   // 2. Commit all operations at once.
//   // If any part fails, the entire batch is rolled back.
//   await batch.commit();

//   // 3. Fetch and return the final data for the UI
//   const finalWishlistRef = doc(db, "wishlists", finalWishlistId);
//   const finalDocSnap = await getDoc(finalWishlistRef);
//   return finalDocSnap.data() as Wishlist;
// }

export async function saveWishlistToDb(
  wishlistData: CreateWishlist,
  wishlistId?: string,
  previousPostIds?: string[],
  previousCoverImageUrl?: string, // <-- 1. Add new parameter
): Promise<Wishlist> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to create or update a wishlist.");
  }

  const validatedData = createWishlistSchema.parse(wishlistData);
  const newPostIds = validatedData.posts;
  const newCoverImageUrl = validatedData.cover_image;

  const batch = writeBatch(db);
  let finalWishlistId: string;
  let deleteImagePromise: Promise<void> | null = null;

  if (wishlistId && previousPostIds !== undefined) {
    // --- ATOMIC UPDATE PATH ---
    finalWishlistId = wishlistId;
    const wishlistRef = doc(db, "wishlists", wishlistId);

    // 2. Check if the cover image has changed and needs to be deleted
    if (previousCoverImageUrl && previousCoverImageUrl !== newCoverImageUrl) {
      try {
        const oldImageRef = ref(storage, previousCoverImageUrl);
        deleteImagePromise = deleteObject(oldImageRef);
      } catch (error) {
        // This can happen if the URL is malformed. Log it but don't block the update.
        console.error(
          "Failed to create reference to old image for deletion:",
          error,
        );
      }
    }

    // (The rest of your existing update logic remains the same)
    const postsToAdd = newPostIds.filter((id) => !previousPostIds.includes(id));
    const postsToRemove = previousPostIds.filter(
      (id) => !newPostIds.includes(id),
    );

    const wishlistToUpdate = { ...validatedData, updatedAt: serverTimestamp() };
    batch.update(wishlistRef, wishlistToUpdate);

    postsToAdd.forEach((postId) => {
      const postRef = doc(db, "posts", postId);
      batch.update(postRef, { wishlists: arrayUnion(wishlistId) });
    });

    postsToRemove.forEach((postId) => {
      const postRef = doc(db, "posts", postId);
      batch.update(postRef, { wishlists: arrayRemove(wishlistId) });
    });
  } else {
    // --- ATOMIC CREATE PATH ---
    // (This path remains unchanged)
    const newWishlistRef = doc(collection(db, "wishlists"));
    finalWishlistId = newWishlistRef.id;

    const newWishlist: DbWishlist = {
      id: finalWishlistId,
      ...validatedData,
      owner: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(newWishlistRef, newWishlist);
    // Add all post updates to the batch
    newPostIds.forEach((postId) => {
      const postRef = doc(db, "posts", postId);
      batch.update(postRef, { wishlists: arrayUnion(finalWishlistId) });
    });
  }

  // 3. Concurrently execute the Firestore batch and the image deletion
  const allPromises: Promise<void | null>[] = [batch.commit()];
  if (deleteImagePromise) {
    // We add a catch here so a failed image deletion (e.g., file not found)
    // doesn't cause the entire operation to throw an error for the user.
    allPromises.push(
      deleteImagePromise.catch((err) =>
        console.warn("Old image deletion failed but wishlist was saved:", err),
      ),
    );
  }

  await Promise.all(allPromises);

  // Fetch and return the final data for the UI
  const finalWishlistRef = doc(db, "wishlists", finalWishlistId);
  const finalDocSnap = await getDoc(finalWishlistRef);
  return finalDocSnap.data() as Wishlist;
}

export async function getUserWishlists({
  userId,
}: {
  userId: string;
}): Promise<Wishlist[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to get wishlists.");
  }

  const wishlistsRef = collection(db, "wishlists");

  const q = query(
    wishlistsRef,
    where("owner", "==", userId),
    orderBy("createdAt", "desc"),
    limit(100),
  );

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const lists = docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Wishlist[];

  return lists;
}

/**
 * Deletes a wishlist document from Firestore and its associated cover image from Storage.
 * @param {object} params - The parameters for the function.
 * @param {Wishlist} params.wishlist - The wishlist object to be deleted.
 */
export async function deleteWishlist({ wishlist }: { wishlist: Wishlist }) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Must be logged in to delete a wishlist.");
  }

  if (wishlist.owner !== user.uid) {
    throw new Error("You can only delete your own wishlists.");
  }

  try {
    // Create a reference to the Firestore document
    const wishlistDocRef = doc(db, "wishlists", wishlist.id);

    // Prepare the deletion promises
    const deletionPromises: Promise<void>[] = [];

    // Add the Firestore document deletion to the list of promises
    deletionPromises.push(deleteDoc(wishlistDocRef));

    // If a cover image URL exists, create a reference and add its deletion to the promises
    if (wishlist.cover_image) {
      const imageRef = ref(storage, wishlist.cover_image);
      deletionPromises.push(deleteObject(imageRef));
    }

    // Execute all delete operations concurrently
    await Promise.all(deletionPromises);
  } catch (error) {
    console.error("Error during wishlist deletion: ", error);

    throw new Error("Failed to delete the wishlist and its resources.");
  }
}
export async function addWishToList() {}
export async function removeWishFromList() {}

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

//*******************************
// Gift functionality
// ******************************

/**
 * Reserve a gift for a post
 * @param postId - The ID of the post to gift
 * @param post - The full post object (for denormalization)
 * @returns The created gift document
 */
export async function reserveGift(postId: string, post: PostType) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to reserve a gift");
  }

  if (user.uid === post.author.uid) {
    throw new Error("You cannot gift your own post");
  }

  if (post.giftStatus !== "available") {
    throw new Error("This gift is already reserved or gifted");
  }

  const giftId = `${postId}_${user.uid}`;
  const giftRef = doc(db, "gifts", giftId);
  const postRef = doc(db, "posts", postId);

  // Check if gift already exists
  const existingGift = await getDoc(giftRef);
  if (existingGift.exists() && existingGift.data().status === "reserved") {
    throw new Error("You have already reserved this gift");
  }

  // Get current user's profile for denormalization
  const userProfileRef = doc(db, "users", user.uid);
  const userProfileSnap = await getDoc(userProfileRef);

  if (!userProfileSnap.exists()) {
    throw new Error("User profile not found");
  }

  const userData = userProfileSnap.data();

  // Use batch write for atomicity
  const batch = writeBatch(db);

  const newGift = {
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

    status: "reserved",
    reservedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    ),
    revealIdentityAfterConfirmation: true,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Create gift document
  batch.set(giftRef, newGift);

  // Update post with reservation
  batch.update(postRef, {
    giftStatus: "reserved",
    gifter: {
      uid: user.uid,
      photoUrl: userData.photoURL || undefined,
      displayName: userData.displayName || "Anonymous",
      handle: userData.handle || user.uid,
    },
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
    trackingInfo?: string;
    messageToRecipient?: string;
    deliveryMethod?: "shipped" | "digital" | "in-person" | "other";
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
    ...(options?.trackingInfo && { trackingInfo: options.trackingInfo }),
    ...(options?.messageToRecipient && {
      messageToRecipient: options.messageToRecipient,
    }),
    ...(options?.deliveryMethod && {
      deliveryMethod: options.deliveryMethod,
    }),
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
  batch.update(giftRef, {
    status: "cancelled",
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Return post to available status
  batch.update(postRef, {
    giftStatus: "available",
    gifter: null, // Remove gifter info
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Alternatively, you could delete the gift document entirely:
  // await deleteDoc(giftRef);

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
