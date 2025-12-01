import type { FieldValue, Timestamp } from "firebase/firestore";
import z from "zod";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  handle: string;
  followers: string[];
  following: string[];
  updatedAt: FieldValue;
  createdAt?: FieldValue;
};

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
    .number()
    .describe(
      "Price of the wish, if available. Extract it exactly as shown on the page. If no price found, return 0.",
    ),

  brand: z
    .string()
    .describe(
      "Brand or source of the wish. For products: the manufacturer or seller. For travel, experiences, or services: use the provider, platform, or location name. If unavailable, return an empty string.",
    ),
});

export type ScrapedWishData = z.infer<typeof scrapedWishSchema>;

export type ScrapedWishDataWithOriginalUrl = ScrapedWishData & {
  original_url: string;
};

export type ScrapeWishInput = {
  url: string;
};

// export const postStatuses = ["draft", "published"] as const;
// export type PostStatus = (typeof postStatuses)[number];
export type PostType = {
  id?: string;
  image: string;
  title: string;
  brand: string;
  description: string;
  price: number;
  wishUrlOriginal: string;
  wishUrlAffiliate?: string;
  likes: string[];
  saves: string[];
  wishlists: string[];
  gifted: boolean;

  createdBy: string;

  userUid: string;
  userName: string | null;
  userAvatar: string | null;
  userHandle: string;

  isPublished: boolean;

  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type DbPostType = Omit<
  PostType,
  "createdAt" | "updatedAt" | "publishedAt"
> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
  publishedAt: FieldValue | null;
};

export const newWishSchema = z.object({
  wish_image: z.string().min(1, { message: "Image is required." }),
  wish_title: z
    .string()
    .trim()
    .min(1, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  wish_description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." })
    .max(500, { message: "Description cannot exceed 250 characters." }),
  wish_price: z
    .number()
    .positive({ message: "Price must be greater than 0." })
    .min(0.01, { message: "Price must be at least 0.01." })
    .max(999999.99, { message: "Price cannot exceed 999,999.99." }),
  brand: z
    .string()
    .trim()
    .min(1, { message: "Brand is required." })
    .max(50, { message: "Brand cannot exceed 50 characters." }),
  wish_url: z.url().min(1, { message: "Url to your wish is required." }),
});

export type NewWishType = z.infer<typeof newWishSchema>;
export type CreateWishType = NewWishType & {
  isPublished: boolean;
};
