import Firecrawl from "@mendable/firecrawl-js";
import { scrapeProductSchema } from ".";

export async function scrapeWithRetry({
  firecrawl,
  url,
}: {
  firecrawl: Firecrawl;
  url: string;
}) {
  try {
    const scrapeResult = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          schema: scrapeProductSchema,
          prompt:
            "You are scraping a product page. Get the information about the product to construct a social post about it.",
        },
      ],
    });

    const statusCode = scrapeResult?.metadata?.statusCode;
    if (statusCode && [401, 403, 500].includes(statusCode)) {
      console.log(`Got status code ${statusCode}, retrying with stealth proxy`);
      return await firecrawl.scrape(url, {
        formats: [
          {
            type: "json",
            schema: scrapeProductSchema,
            prompt:
              "You are scraping a product page. Get the information about the product to construct a social post about it.",
          },
        ],
        proxy: "stealth",
      });
    }

    return scrapeResult;
  } catch (error) {
    console.error(`Initial scrape failed: ${error}`);
    try {
      return await firecrawl.scrape(url, {
        formats: [
          {
            type: "json",
            schema: scrapeProductSchema,
            prompt:
              "You are scraping a product page. Get the information about the product to construct a social post about it.",
          },
        ],
        proxy: "stealth",
      });
    } catch (retryError: any) {
      console.error(`Stealth proxy also failed: ${retryError.message}`);
      throw new Error("Error scraping the product with retry!");
    }
  }
}
