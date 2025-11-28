import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from ".";
import type { CreateWishType, NewPostType, UserProfile } from "../types";

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
    userName: userProfile?.displayName ?? user.displayName,
    userAvatar: userProfile?.photoURL ?? user.photoURL,
    userHandle: userProfile?.handle,

    status: wishData.status,
    ...(wishData.status === "draft"
      ? { publishedAt: null }
      : { publishedAt: serverTimestamp() }),
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
