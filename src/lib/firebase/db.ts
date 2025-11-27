import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from ".";
import type { NewWishType, PostType } from "../types";

import { auth } from "./auth";

export const db = getFirestore(firebaseApp);

export async function saveWishPostToDb(wishData: NewWishType) {
  try {
    const user = auth.currentUser;

    if (!user || !user.displayName) {
      throw new Error("Must be logged in to be able to save posts to db.");
    }

    const fullPost: PostType = {
      image: wishData.wish_image,
      title: wishData.wish_title,
      description: wishData.wish_description,
      price: wishData.wish_price,
      brand: wishData.brand,
      wishUrl: wishData.wish_url,
      likes: [],
      saves: [],
      gifted: false,
      userUid: user.uid,
      userName: user.displayName || "Unknown User",
      userAvatar: user.photoURL || "",
      // userHandle: user.handle,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(collection(db, "posts"), fullPost);
  } catch (error) {}
}
