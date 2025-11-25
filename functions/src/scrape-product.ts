import { HttpsError, onCall } from "firebase-functions/v2/https";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as logger from "firebase-functions/logger";
import z from "zod";

export const scrapedProductSchema = z.object({
  product_title: z.string(),
  product_price: z.string(),
  product_description: z.string(),
  brand: z.string(),
  product_image_url: z.string(),
});

export type scrapedProductType = z.infer<typeof scrapedProductSchema>;

export interface ScrapeProductInput {
  url: string;
}

// What the function returns
export interface ScrapeProductOutput {
  message?: string;
  scrapeResult?: scrapedProductType;
}

export const scrapeProduct = onCall<ScrapeProductInput, ScrapeProductOutput>(
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

    const firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
    });
    try {
      const scrapeResult = await firecrawl.scrape(url, {
        formats: [
          {
            type: "json",
            schema: scrapedProductSchema,
          },
          { type: "images" },
        ],
      });

      // Check if we got an error status code
      const statusCode = scrapeResult?.metadata?.statusCode;
      if (statusCode && [401, 403, 500].includes(statusCode)) {
        console.log(
          `Got status code ${statusCode}, retrying with stealth proxy`,
        );
        // Retry with stealth proxy
        return await firecrawl.scrape(url, {
          proxy: "stealth",
        });
      }

      return scrapeResult;
    } catch (error) {
      logger.error("Scraping failed", error);
      // Retry with stealth proxy on exception
      try {
        return await firecrawl.scrape(url, {
          proxy: "stealth",
        });
      } catch (retryError: any) {
        console.error(`Stealth proxy also failed: ${retryError.message}`);
        throw new HttpsError(
          "internal",
          error instanceof Error
            ? retryError.message
            : "Scraping service failed",
        );
      }
    }
  },
);
