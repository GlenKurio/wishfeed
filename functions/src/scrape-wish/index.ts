import { HttpsError, onCall } from "firebase-functions/v2/https";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as logger from "firebase-functions/logger";
import z from "zod";
import { scrapeWithRetry } from "./scrape-with-retry";

export const scrapedWishSchema = z.object({
  wish_image: z
    .string()
    .describe(
      "URL of the main image representing the wish. Prefer the first large, clear image on the page, usually the primary product or hero image.",
    ),

  wish_title: z
    .string()
    .describe(
      "Short title of the wish. Should clearly describe what the item, place, experience, or service is.",
    ),

  wish_description: z
    .string()
    .max(500)
    .describe(
      "A concise and appealing description of the wish. Summarize key details, features, or highlights. Must be under 500 characters, friendly, and easy to read.",
    ),

  wish_price: z
    .string()
    .describe(
      "Price of the wish, if available. Extract it exactly as shown on the page (including currency symbols). If no price exists, return an empty string.",
    ),

  brand: z
    .string()
    .describe(
      "Brand or source of the wish. For products: the manufacturer or seller. For travel, experiences, or services: use the provider, platform, or location name. If unavailable, return an empty string.",
    ),
});

export type ScrapedWishData = z.infer<typeof scrapedWishSchema>;

export type ScrapeWishInput = {
  url: string;
};

export const scrapeWish = onCall<ScrapeWishInput, Promise<ScrapedWishData>>(
  { secrets: ["FIRECRAWL_API_KEY"], timeoutSeconds: 60, memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to scrape products",
      );
    }

    const { url } = request.data;

    if (!url || typeof url !== "string") {
      throw new HttpsError("invalid-argument", "A valid URL is required");
    }

    try {
      const firecrawl = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
      });

      const scrapedWish = await scrapeWithRetry({ firecrawl, url });

      // Firecrawl returns json directly on the response object
      if (!scrapedWish?.json) {
        throw new HttpsError("internal", "No data returned from scraper");
      }
      // TODO:
      // - Check returned data using AI (checkScrapingResult)
      // - If some data is lacking fire a web search to find it

      // Return the typed data directly
      return scrapedWish.json as ScrapedWishData;
    } catch (error) {
      logger.error("Scraping failed", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Scraping service failed",
      );
    }
  },
);
