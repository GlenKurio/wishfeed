import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  createWishlistSchema,
  type CreateWishlist,
  type DbWishlist,
  type Wishlist,
} from "../../types";

import { deleteObject, ref } from "firebase/storage";
import { db } from "..";
import { auth } from "../auth";
import { storage } from "../storage";

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
