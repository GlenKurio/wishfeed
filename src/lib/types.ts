import type { FieldValue, Timestamp } from "firebase/firestore";
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

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  handle: string;
  bio?: string;
  birthday?: string; // ISO date "YYYY-MM-DD"
  isPublic: boolean;
  followers: string[];
  following: string[];
  posts: number;
  updatedAt: Timestamp;
  createdAt: Timestamp;
};

export type DbUserProfile = Omit<UserProfile, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

// export const updateUserProfileSchema = z.object({
//   // Display Name: Required, max 50 chars
//   displayName: z
//     .string()
//     .min(1, { message: "Display name is required" })
//     .max(50, { message: "Display name cannot exceed 50 characters" }),

//   // Handle: Alphanumeric + underscores, 3-20 chars
//   handle: z
//     .string()
//     .min(3, { message: "Handle must be at least 3 characters" })
//     .max(20, { message: "Handle cannot exceed 20 characters" })
//     .regex(/^[a-zA-Z0-9_]+$/, {
//       message: "Handle can only contain letters, numbers, and underscores",
//     }),

//   bio: z.string().max(150, { message: "Bio cannot exceed 150 characters." }),
//   isPublic: z.boolean(),
//   birthday: z.string().max(),
//   email:

//   // Photo URL: Optional (used if they don't upload a new file but keep the old one)
//   avatar: z.string().min(1, { message: "Avatar is required." }),
// });

export const updateUserProfileSchema = z.object({
  // Display Name: Required, max 50 chars
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),

  // Username / Handle
  handle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters")
    .max(20, "Handle cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Handle can only contain letters, numbers, and underscores",
    }),

  // Bio: Optional string, max 150 chars
  bio: z
    .string()
    .trim()
    .max(150, "Bio cannot exceed 150 characters")
    .optional(),

  // Profile privacy
  isPublic: z.boolean().default(true),

  // Birthday: Optional ISO date string (YYYY-MM-DD)
  // Also validates correct date format
  birthday: z.date("Birthday must be a valid date (YYYY-MM-DD)").optional(),

  // Avatar URL: Optional — user may keep old one or upload new one
  avatar: z.string().optional(),
});

export type UpdatedUserProfile = z.infer<typeof updateUserProfileSchema>;
