import { HttpsError, onCall } from "firebase-functions/v2/https";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as logger from "firebase-functions/logger";
import z from "zod";
import { scrapeWithRetry } from "./scrape-with-retry";

export const scrapeProductSchema = z.object({
  product_image: z
    .string()
    .describe("For product_image use first image in the carousel on the page"),
  product_title: z.string().describe("Title of the product"),
  product_description: z
    .string()
    .max(250)
    .describe(
      "Product description including specifications. Keep it short and sweet. Maximum length is 250 charachters",
    ),
  product_price: z.string().describe("Product price"),
  brand: z.string().describe("Product brand"),
});

export type ScrapeProductData = z.infer<typeof scrapeProductSchema>;

export type ScrapeProductInput = {
  url: string;
};

export type ScrapeProductOutput = ScrapeProductData;

export const scrapeProduct = onCall<
  ScrapeProductInput,
  Promise<ScrapeProductOutput>
>(
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

      const scrapedProduct = await scrapeWithRetry({ firecrawl, url });

      // Firecrawl returns json directly on the response object
      if (!scrapedProduct?.json) {
        throw new HttpsError("internal", "No data returned from scraper");
      }
      // TODO:
      // - Check returned data using AI (checkScrapingResult)
      // - If some data is lacking fire a web search to find it

      // Return the typed data directly
      return scrapedProduct.json as ScrapeProductOutput;
    } catch (error) {
      logger.error("Scraping failed", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Scraping service failed",
      );
    }
  },
);
