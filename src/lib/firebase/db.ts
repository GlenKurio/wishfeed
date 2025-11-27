import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from ".";
import type { NewWishType, PostType } from "../types";

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
  const fullPost: PostType = {
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

    createdAt: serverTimestamp(), // Firestore backend timestamp
    updatedAt: serverTimestamp(),
  };

  // Save the document
  const docRef = await addDoc(collection(db, "posts"), fullPost);

  // Return final post with id
  return { id: docRef.id, ...fullPost };
}
