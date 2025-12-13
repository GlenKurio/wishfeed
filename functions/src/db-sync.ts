import {
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/**
 * Trigger when a user document is updated
 * This keeps denormalized user data in sync across followers/following collections and posts
 */
export const syncUserDataOnUpdate = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      logger.log("Missing data in event, skipping sync");
      return;
    }

    const relevantFields = ["displayName", "photoURL", "handle"];
    const hasRelevantChanges = relevantFields.some(
      (field) => beforeData[field] !== afterData[field],
    );

    if (!hasRelevantChanges) {
      logger.log("No relevant changes detected, skipping sync");
      return;
    }

    logger.log(`Syncing user data for userId: ${userId}`);

    const batch = db.batch();
    let updateCount = 0;

    try {
      // Update followers
      const followersSnapshot = await db
        .collectionGroup("followers")
        .where("uid", "==", userId)
        .get();

      followersSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          displayName: afterData.displayName,
          photoURL: afterData.photoURL,
          handle: afterData.handle,
        });
        updateCount++;
      });

      // Update following
      const followingSnapshot = await db
        .collectionGroup("following")
        .where("uid", "==", userId)
        .get();

      followingSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          displayName: afterData.displayName,
          photoURL: afterData.photoURL,
          handle: afterData.handle,
        });
        updateCount++;
      });

      // Update posts with nested object syntax
      const postsSnapshot = await db
        .collection("posts")
        .where("author.id", "==", userId)
        .get();

      postsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          "author.displayName": afterData.displayName,
          "author.photoUrl": afterData.photoURL,
          "author.handle": afterData.handle,
        });
        updateCount++;
      });

      logger.log(`Found ${postsSnapshot.size} posts to update`);

      if (updateCount > 0) {
        await batch.commit();
        logger.log(`Successfully updated ${updateCount} documents`);
      }
    } catch (error) {
      logger.error("Error syncing user data:", error);
      throw error;
    }
  },
);

/**
 * Trigger when a user is deleted
 * This cleans up their data from followers/following collections and their posts
 */
export const cleanupUserDataOnDelete = onDocumentDeleted(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;

    logger.log(`Cleaning up data for deleted user: ${userId}`);

    let deleteCount = 0;

    try {
      // Firestore has a limit of 500 operations per batch
      // So we'll use multiple batches if needed
      const batches: admin.firestore.WriteBatch[] = [db.batch()];
      let currentBatchIndex = 0;
      let operationsInCurrentBatch = 0;

      const addToBatch = (ref: admin.firestore.DocumentReference) => {
        if (operationsInCurrentBatch >= 500) {
          batches.push(db.batch());
          currentBatchIndex++;
          operationsInCurrentBatch = 0;
        }
        batches[currentBatchIndex].delete(ref);
        operationsInCurrentBatch++;
        deleteCount++;
      };

      // 1. Remove from all followers collections (where this user is listed as a follower)
      const followersSnapshot = await db
        .collectionGroup("followers")
        .where("uid", "==", userId)
        .get();

      followersSnapshot.docs.forEach((doc) => {
        addToBatch(doc.ref);
      });

      logger.log(
        `Found ${followersSnapshot.size} follower documents to delete`,
      );

      // 2. Remove from all following collections (where this user is listed as following)
      const followingSnapshot = await db
        .collectionGroup("following")
        .where("uid", "==", userId)
        .get();

      followingSnapshot.docs.forEach((doc) => {
        addToBatch(doc.ref);
      });

      logger.log(
        `Found ${followingSnapshot.size} following documents to delete`,
      );

      // 3. Delete their own followers subcollection
      const userFollowersSnapshot = await db
        .collection(`users/${userId}/followers`)
        .get();

      userFollowersSnapshot.docs.forEach((doc) => {
        addToBatch(doc.ref);
      });

      logger.log(
        `Found ${userFollowersSnapshot.size} of user's own followers to delete`,
      );

      // 4. Delete their own following subcollection
      const userFollowingSnapshot = await db
        .collection(`users/${userId}/following`)
        .get();

      userFollowingSnapshot.docs.forEach((doc) => {
        addToBatch(doc.ref);
      });

      logger.log(
        `Found ${userFollowingSnapshot.size} of user's own following to delete`,
      );

      // 5. Delete all posts created by this user
      const postsSnapshot = await db
        .collection("posts")
        .where("author.id", "==", userId)
        .get();

      postsSnapshot.docs.forEach((doc) => {
        addToBatch(doc.ref);
      });

      logger.log(`Found ${postsSnapshot.size} posts to delete`);

      // 6. (Optional) Remove user from likes arrays in other posts
      // Note: This can be expensive if user liked many posts
      // Consider doing this as a separate background job if needed
      const likedPostsSnapshot = await db
        .collection("posts")
        .where("likes", "array-contains", userId)
        .get();

      likedPostsSnapshot.docs.forEach((doc) => {
        if (operationsInCurrentBatch >= 500) {
          batches.push(db.batch());
          currentBatchIndex++;
          operationsInCurrentBatch = 0;
        }
        batches[currentBatchIndex].update(doc.ref, {
          likes: admin.firestore.FieldValue.arrayRemove(userId),
        });
        operationsInCurrentBatch++;
        deleteCount++;
      });

      logger.log(
        `Found ${likedPostsSnapshot.size} posts to remove user from likes`,
      );

      // 7. (Optional) Remove user from saves arrays in other posts
      const savedPostsSnapshot = await db
        .collection("posts")
        .where("saves", "array-contains", userId)
        .get();

      savedPostsSnapshot.docs.forEach((doc) => {
        if (operationsInCurrentBatch >= 500) {
          batches.push(db.batch());
          currentBatchIndex++;
          operationsInCurrentBatch = 0;
        }
        batches[currentBatchIndex].update(doc.ref, {
          saves: admin.firestore.FieldValue.arrayRemove(userId),
        });
        operationsInCurrentBatch++;
        deleteCount++;
      });

      logger.log(
        `Found ${savedPostsSnapshot.size} posts to remove user from saves`,
      );

      // Commit all batches
      if (deleteCount > 0) {
        await Promise.all(batches.map((batch) => batch.commit()));
        logger.log(
          `Successfully deleted/updated ${deleteCount} documents across ${batches.length} batch(es)`,
        );
      } else {
        logger.log("No documents to delete");
      }

      return null;
    } catch (error) {
      logger.error("Error cleaning up user data:", error);
      throw error;
    }
  },
);
