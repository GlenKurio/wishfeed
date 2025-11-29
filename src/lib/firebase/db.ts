import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type DocumentData,
} from "firebase/firestore";
import { firebaseApp } from ".";
import type {
  CreateWishType,
  DbPostType,
  PostType,
  UserProfile,
} from "../types";

import type { User } from "firebase/auth";
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

  const userData: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    handle: user.email?.split("@")[0],
    updatedAt: serverTimestamp(),
    followers: [],
    following: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);
  console.log("SUCCESS");
  return;
}

export async function saveWishPostToDb(
  wishData: CreateWishType,
  affiliateLink: string,
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to save posts.");
  }

  // Fetch the user's Firestore profile
  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  let userProfile = null;
  if (userSnap.exists()) {
    userProfile = userSnap.data();
  }

  // Construct the final post object
  const fullPost: DbPostType = {
    image: wishData.wish_image as string,
    title: wishData.wish_title,
    description: wishData.wish_description,
    price: wishData.wish_price,
    brand: wishData.brand,
    wishUrlOriginal: wishData.wish_url,
    wishUrlAffiliate: affiliateLink,
    likes: [],
    saves: [],
    gifted: false,

    userUid: user.uid,
    userName: userProfile?.displayName ?? user.displayName,
    userAvatar: userProfile?.photoURL ?? user.photoURL,
    userHandle: userProfile?.handle,

    isPublished: wishData.isPublished,
    ...(wishData.isPublished
      ? { publishedAt: serverTimestamp() }
      : { publishedAt: null }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Create a reference to the user's posts subcollection with an auto-generated ID
  const postsRef = collection(db, "posts"); // ✅ 1 segment = collection
  const newPostRef = doc(postsRef); // Creates posts/{autoId}

  // Save the document at posts/{userUid}/{postId}
  await setDoc(newPostRef, fullPost);

  // Return final post with id
  return { id: newPostRef.id, ...fullPost };
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

export async function getUserPostsPaginated(
  userId: string,
  published: boolean = true,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<PaginatedPostsResult> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error("Must be logged in to view posts.");
  }

  const postsRef = collection(db, "posts");

  let q = query(
    postsRef,
    where("userUid", "==", userId),
    where("isPublished", "==", published),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1),
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

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
