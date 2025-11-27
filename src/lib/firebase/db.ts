import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from ".";
import type { NewPostType, NewWishType } from "../types";

import { auth } from "./auth";

export const db = getFirestore(firebaseApp);

export async function saveWishPostToDb(
  wishData: NewWishType,
  affiliateLink: string,
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in to save posts.");
  }

  // Fetch the user's Firestore profile (optional but recommended)
  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  let userProfile = null;
  if (userSnap.exists()) {
    userProfile = userSnap.data();
  }

  // Construct the final post object
  const fullPost: NewPostType = {
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
    userName: userProfile?.name ?? user.displayName,
    userAvatar: userProfile?.avatar ?? user.photoURL,
    userHandle: userProfile?.handle,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Create a reference to the user's posts subcollection with an auto-generated ID
  const userPostsRef = collection(db, "posts", user.uid);
  const newPostRef = doc(userPostsRef); // Generates a unique ID

  // Save the document at posts/{userUid}/{postId}
  await setDoc(newPostRef, fullPost);

  // Return final post with id
  return { id: newPostRef.id, ...fullPost };
}
