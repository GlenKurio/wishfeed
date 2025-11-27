import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";
import { firebaseApp } from ".";
import type { ScrapeWishInput, ScrapedWishData } from "../types";

export const functions = getFunctions(firebaseApp);
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export async function scrapeWishUrl({ url }: ScrapeWishInput) {
  const createWishFunction = httpsCallable<ScrapeWishInput, ScrapedWishData>(
    functions,
    "scrapeWish",
  );

  const result: HttpsCallableResult<ScrapedWishData> = await createWishFunction(
    {
      url,
    },
  );

  return result.data;
}

export async function swapUrl({ url }: { url: string }) {}
