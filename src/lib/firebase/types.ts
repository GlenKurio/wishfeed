import z from "zod";

export const scrapeProductSchema = z.object({
  product_image: z
    .string()
    .describe("For product_image use first image in the carousel on the page"),
  product_title: z.string().describe("Title of the product"),
  product_description: z
    .string()
    .describe("Product description including specifications"),
  product_price: z.string().describe("Product price"),
  brand: z.string().describe("Product brand"),
});

export type ScrapeProductData = z.infer<typeof scrapeProductSchema>;

export type ScrapeProductInput = {
  url: string;
};

export type ScrapeProductOutput = ScrapeProductData;
