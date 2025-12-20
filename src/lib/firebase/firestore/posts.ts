import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import {
  newWishSchema,
  type DbPostType,
  type NewWishType,
  type PostType,
} from "../../types";

import { db } from "..";
import { auth } from "../auth";
import { swapUrl } from "../functions";

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
    gift: {
      giftStatus: "available",
    },

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
