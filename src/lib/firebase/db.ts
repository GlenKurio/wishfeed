import {
  collection,
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
  serverTimestamp,
  setDoc,
  startAfter,
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
  type NewWishType,
  type PostType,
  type UserProfile,
  type Wishlist,
} from "../types";

import { updateProfile, type User } from "firebase/auth";
import { auth } from "./auth";

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
    followers: [],
    following: [],
    posts: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  console.log("SUCCESS");
  return;
}

export async function saveWishPostToDb(
  wishData: NewWishType,
  affiliateLink: string,
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to save posts.");
  }
  const validatedData = newWishSchema.parse(wishData);
  // 1. Get a new write batch
  const batch = writeBatch(db);

  // 2. Create a reference for the new post document in the 'posts' collection
  const newPostRef = doc(collection(db, "posts"));

  // 3. Create a reference to the user's profile document
  const userProfileRef = doc(db, "users", user.uid);

  // Construct the final post object, now including the author's UID
  const fullPost: DbPostType = {
    id: newPostRef.id, // Store the auto-generated ID right in the document
    createdBy: user.uid, // Crucial for querying posts by user
    image: validatedData.wish_image as string,
    title: validatedData.wish_title,
    description: validatedData.wish_description,
    price: validatedData.wish_price,
    brand: validatedData.brand,
    wishUrlOriginal: validatedData.wish_url,
    wishUrlAffiliate: affiliateLink,
    likes: [],
    saves: [],
    wishlists: [],
    gifted: false,
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
      postCount: increment(1),
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
  allPosts.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

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
    where("createdBy", "==", userId),
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

export async function editUserProfile({
  updatedUserProfile,
}: {
  updatedUserProfile: UserProfile;
}) {
  const user = auth.currentUser;

  if (!user || user.uid !== updatedUserProfile.uid) {
    throw new Error("Must be logged in to update a profile.");
  }

  // 1. Update Firebase Authentication profile
  await updateProfile(user, {
    displayName: updatedUserProfile.displayName,
    photoURL: updatedUserProfile.photoURL,
  });

  // 2. Update the userProfile document in Firestore
  const userProfileDocRef = doc(db, "users", updatedUserProfile.uid);
  await updateDoc(userProfileDocRef, updatedUserProfile);
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

export async function saveWishlistToDb(
  wishlistData: CreateWishlist,
  wishlistId?: string,
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Must be logged in to create or update a wishlist.");
  }

  // Validate the incoming data
  const validatedData = createWishlistSchema.parse(wishlistData);

  if (wishlistId) {
    // If a wishlistId is provided, update the existing wishlist
    const wishlistRef = doc(db, "wishlists", wishlistId);

    // Prepare the data for update, ensuring we don't try to update the 'id' or 'owner'
    const { ...dataToUpdate } = validatedData;
    const wishlistToUpdate: Partial<
      Omit<DbWishlist, "id" | "owner" | "createdAt">
    > = {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(wishlistRef, wishlistToUpdate);
    return { message: "updated" };
  } else {
    // If no wishlistId is provided, create a new wishlist

    // 1. Create a reference for a new document to get its auto-generated ID
    const newWishlistRef = doc(collection(db, "wishlists"));

    // 2. Include the new document's ID in the object you're creating
    const newWishlist: DbWishlist = {
      id: newWishlistRef.id, // Assign the generated ID here
      ...validatedData,
      owner: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 3. Use setDoc to save the complete object to the new document reference
    await setDoc(newWishlistRef, newWishlist);
    return { message: "created" };
  }
}

export async function getUserWishlists({
  userId,
}: {
  userId: string;
}): Promise<Wishlist[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to save posts.");
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

export async function addWishToList() {}
export async function removeWishFromList() {}
