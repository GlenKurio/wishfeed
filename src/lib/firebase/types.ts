import z from "zod";

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
    .max(250)
    .describe(
      "A concise and appealing description of the wish. Summarize key details, features, or highlights. Must be under 250 characters, friendly, and easy to read.",
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
