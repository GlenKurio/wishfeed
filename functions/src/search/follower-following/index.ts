import { onCall } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { create, search, insert } from "@orama/orama";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

// Define the schema for our in-memory search index
const userSchema = {
  displayName: "string",
  handle: "string",
  uid: "string",
  photoURL: "string",
  followedAt: "string", // Orama doesn't support Timestamp directly, we'll convert
} as const;

export type FollowerFollowingInfo = {
  uid: string;
  displayName: string;
  handle: string;
  photoURL?: string;
  followedAt: FirebaseFirestore.Timestamp;
};

export type SearchUsersInput = {
  searchTerm: string;
  collection: "followers" | "following";
};

export type SearchUsersResult = {
  users: FollowerFollowingInfo[];
};

export const searchUsers = onCall<SearchUsersInput, Promise<SearchUsersResult>>(
  {},
  async (request) => {
    // 1. Validate authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to search users",
      );
    }

    const { searchTerm, collection } = request.data;

    // 2. Validate input
    if (!searchTerm || typeof searchTerm !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A valid search term is required",
      );
    }

    if (!collection || !["followers", "following"].includes(collection)) {
      throw new HttpsError(
        "invalid-argument",
        "Collection must be either 'followers' or 'following'",
      );
    }

    try {
      // 3. Fetch ALL user documents from the specified collection
      const usersSnapshot = await db
        .collection("users")
        .doc(request.auth.uid)
        .collection(collection)
        .get();

      const usersData = usersSnapshot.docs.map(
        (doc) => doc.data() as FollowerFollowingInfo,
      );

      if (usersData.length === 0) {
        return { users: [] };
      }

      // 4. Create an in-memory Orama database on-the-fly
      const userDB = await create({
        schema: userSchema,
      });

      // Convert Timestamps to ISO strings for Orama indexing
      const usersForSearch = usersData.map((user) => ({
        ...user,
        photoURL: user.photoURL || "", // Orama needs a string, not undefined
        followedAt: user.followedAt.toDate().toISOString(),
      }));

      // Insert all users into the database
      for (const user of usersForSearch) {
        await insert(userDB, user);
      }

      // 5. Perform the fuzzy search
      const searchResult = await search(userDB, {
        term: searchTerm,
        properties: ["displayName", "handle"], // Search both fields
        tolerance: 2, // Allow up to 2 typos
        limit: 25, // Return top 25 results
      });

      // 6. Return the results with original Timestamp objects
      const resultUids = new Set(
        searchResult.hits.map((hit) => hit.document.uid),
      );
      const users = usersData.filter((user) => resultUids.has(user.uid));

      return { users };
    } catch (error) {
      logger.error(`Error searching ${collection}:`, error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Search service failed",
      );
    }
  },
);
