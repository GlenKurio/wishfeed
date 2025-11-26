import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";
import { firebaseApp } from ".";
import type { ScrapeProductInput, ScrapeProductOutput } from "./types";

export const functions = getFunctions(firebaseApp);
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export async function scrapeProductUrl({ url }: ScrapeProductInput) {
  const createWishFunction = httpsCallable<
    ScrapeProductInput,
    ScrapeProductOutput
  >(functions, "scrapeProduct");

  const result: HttpsCallableResult<ScrapeProductOutput> =
    await createWishFunction({
      url,
    });

  return result.data;
}

// export async function swapUrl({ url }: { url: string }) {}
