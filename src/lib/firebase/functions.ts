import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";
import { firebaseApp } from ".";
import type {
  FollowerFollowingInfo,
  ScrapeWishInput,
  ScrapedWishData,
  ScrapedWishDataWithOriginalUrl,
} from "../types";

export const functions = getFunctions(firebaseApp);
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export async function scrapeWishUrl({
  url,
}: ScrapeWishInput): Promise<ScrapedWishDataWithOriginalUrl> {
  const createWishFunction = httpsCallable<ScrapeWishInput, ScrapedWishData>(
    functions,
    "scrapeWish",
  );

  const result: HttpsCallableResult<ScrapedWishData> = await createWishFunction(
    {
      url,
    },
  );

  return {
    ...result.data,
    original_url: url,
  };
}

export async function swapUrl(url: string) {
  return url;
}

export type SearchUsersInput = {
  searchTerm: string;
  collection: "followers" | "following";
};

export type SearchUsersResult = {
  users: FollowerFollowingInfo[];
};

export async function searchUsers({
  searchTerm,
  collection,
}: SearchUsersInput): Promise<SearchUsersResult> {
  const searchUsersFunction = httpsCallable<
    SearchUsersInput,
    SearchUsersResult
  >(functions, "searchUsers");

  const result: HttpsCallableResult<SearchUsersResult> =
    await searchUsersFunction({ searchTerm, collection });

  return result.data;
}

// Convenience functions if you want to keep simpler APIs
export async function searchFollowers(
  searchTerm: string,
): Promise<SearchUsersResult> {
  return searchUsers({ searchTerm, collection: "followers" });
}

export async function searchFollowing(
  searchTerm: string,
): Promise<SearchUsersResult> {
  return searchUsers({ searchTerm, collection: "following" });
}
