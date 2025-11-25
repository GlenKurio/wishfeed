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

export interface ScrapeProductOutput {
  message?: string;
  scrapeResult?: scrapedProductType;
}
