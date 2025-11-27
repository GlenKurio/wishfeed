import Firecrawl from "@mendable/firecrawl-js";
import { scrapedWishSchema } from ".";

const pompt = `
You are extracting structured data to create a user's "wish" for a wishlist and social discovery platform.

A "wish" can be:
- a physical product (ex: iPhone, book, shoes)
- an experience (ex: hot air balloon ride, spa day)
- a place or destination (ex: Paris, Iceland, Kyoto temple)
- a travel option (ex: hotel, tour package, Airbnb listing)
- an activity (ex: cooking class, skydiving, museum ticket)
- a service (ex: cleaning service, subscription, personal trainer)

Your job:
- Understand what type of page this is (product / travel / experience / service).
- Extract information that best represents the item as a wishlist item.
- Follow the schema strictly.
- Keep the description short, friendly, appealing, and under 250 characters.
- If a field does not exist (e.g., price or brand), return an empty string instead of guessing.

Rules:
- wish_image: choose the main/hero image or first clear image on the page.
- wish_title: short, clear, and human-friendly.
- wish_description: concise, engaging, under 500 characters. No fluff.
- wish_price: if no price is available, return an empty string.
- brand: for products = manufacturer/seller; for experiences/places/services = provider or location name, or empty string if not applicable.

Return only valid JSON matching the provided schema.
`;

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
          schema: scrapedWishSchema,
          pompt,
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
            schema: scrapedWishSchema,
            pompt,
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
            schema: scrapedWishSchema,
            pompt,
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
