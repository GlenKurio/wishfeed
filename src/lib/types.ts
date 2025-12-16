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

// /post/{postId}
export type PostType = {
  id?: string;
  image: string;
  title: string;
  brand: string;
  description: string;
  price: number;
  wishUrlOriginal: string;
  wishUrlAffiliate?: string;
  likesCount: number;
  repostsCount: number;
  wishlists: string[];

  author: {
    uid: string;
    photoUrl?: string;
    displayName: string;
    handle: string;
  };

  giftStatus: "available" | "reserved" | "sent" | "gifted";
  // TODO: update gifter data on user profile update
  gifter?: {
    uid: string;
    photoUrl?: string;
    displayName: string;
    handle: string;
  };

  isPublished: boolean;

  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
// TODO: update likes and reposts on user profile update
// /posts/{postsId}/likes/{userId}
export type PostLikeRepostType = {
  displayName: string;
  handle: string;
  photoUrl: string;
  createdAt: Timestamp;
};

export type DbPostType = Omit<
  PostType,
  "createdAt" | "updatedAt" | "publishedAt"
> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
  publishedAt: FieldValue | null;
};

export const deliveryMethods = [
  "delivery",
  "digital",
  "in-person",
  "other",
] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];
// /gifts/{giftId}
export type GiftType = {
  id?: string;

  // References
  postId: string; // Reference to the wish/post
  gifterId: string; // Who's giving the gift
  recipientId: string; // Who's receiving (post author)
  // TODO: update wish on post update in db
  wish: {
    title: string;
    image: string;
    brand: string;
    price: number;
  };
  // TODO: update gifter on userProfile update in db
  gifter: {
    uid: string;
    photoUrl?: string;
    displayName: string;
    handle: string;
  };
  // TODO: update recipient on userProfile update in db
  recipient: {
    uid: string;
    photoUrl?: string;
    displayName: string;
    handle: string;
  };

  // Status tracking
  status: "reserved" | "sent" | "confirmed" | "cancelled" | "expired";

  // Timestamps
  reservedAt: Timestamp;
  expiresAt: Timestamp; // Auto-calculated: reservedAt + 30 days
  sentAt?: Timestamp; // When gifter marks as sent
  confirmedAt?: Timestamp; // When recipient confirms receipt
  cancelledAt?: Timestamp; // If gifter cancels

  // Notes
  gifterNotes?: string; // Private notes for gifter (e.g., tracking number)
  recipientNotes?: string; // Private notes from recipient (e.g., thank you message)

  // Optional: Delivery details
  deliveryMethod?: DeliveryMethod;
  trackingInfo?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Reminder tracking
  reminderSentAt?: Timestamp; // When we reminded gifter to send
  confirmationReminderSentAt?: Timestamp; // When we reminded recipient to confirm

  // Privacy
  revealIdentityAfterConfirmation: boolean; // Default true, but could be anonymous gift
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
  isPublished: z.boolean(),
});

export type NewWishType = z.infer<typeof newWishSchema>;

// users/{userId}
export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  handle: string;
  bio?: string;
  birthday?: string | null; // ISO date "YYYY-MM-DD"
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
  followRequestsSentCount: number;
  followRequestsReceivedCount: number;
  postsCount: number;
  updatedAt: Timestamp;
  createdAt: Timestamp;
};

// TODO: on user profile update update gifter
// /users/{userId}/gifters/{gifterId}
export type GifterType = {
  giftCount: number; // (incremented for each gift)
  totalAmountSpent: number; // (sum of the price of all gifts)
  displayName: string;
  photoUrl: string;
  handle: string;
};
// users/{userId}/followers/{followerId}
// users/{userId}/following/{followingId}
export type FollowerFollowingInfo = {
  uid: string;
  displayName: string;
  handle: string;
  photoURL?: string;
  followedAt: Timestamp;
};
// users/{userId}/requests/{requerstId}
export type FollowRequestInfo = {
  uid: string;
  displayName: string;
  handle: string;
  photoURL?: string;
  requestedAt: Timestamp;
};

export type DbUserProfile = Omit<UserProfile, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

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
    .min(3, { message: "Handle must be at least 3 characters" })
    .max(20, { message: "Handle cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Handle can only contain letters, numbers, and underscores",
    }),

  // Bio: Optional string, max 150 chars
  bio: z
    .string()
    .trim()
    .max(250, { message: "Bio cannot exceed 250 characters" }),

  // Profile privacy
  isPublic: z.boolean(),

  // Birthday: Optional ISO date string (YYYY-MM-DD)
  // Also validates correct date format
  birthday: z.string(),

  // Avatar URL: Optional — user may keep old one or upload new one
  photoUrl: z.string(),
});

export type UpdatedUserProfile = z.infer<typeof updateUserProfileSchema>;

export const createWishlistSchema = z.object({
  cover_image: z.string(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(20, "Title cannot exceed 20 characters")
    .refine((val) => val.toLowerCase() !== "drafts", {
      message:
        "'drafts' is a booked keyword in the app and cannot be used as a title.",
    }),
  description: z
    .string()
    .trim()
    .max(150, { message: "Description cannot exceed 150 characters" }),
  posts: z.array(z.string()),
});

export type Wishlist = {
  id: string;
  cover_image: string;
  title: string;
  description: string;
  posts: string[];
  owner: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type DbWishlist = Omit<Wishlist, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type CreateWishlist = z.infer<typeof createWishlistSchema>;

export type GiftModalType =
  | "reserve"
  | "markAsSent"
  | "confirmReceipt"
  | "cancel"
  | "revertToReserved"
  | "revertToSent";

export type GiftActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  modalType: GiftModalType;
  post: PostType;
};

// Zod schemas for validation
export const markAsSentSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods, {
    message: "Delivery method must one of the known ones.",
  }),
  trackingInfo: z.string().max(100, {
    message: "Tracking info cannot be longet than 100 characters.",
  }),
  message: z
    .string()
    .max(500, { message: "Message must be 500 characters or less" }),
});

export const confirmReceiptSchema = z.object({
  message: z
    .string()
    .max(500, { message: "Message must be 500 characters or less" }),
});

export const notificationKinds = [
  "follow",
  "follow_request",
  "follow_request_accepted",
  "like",
  "repost",
  "gift_reserved",
  "gift_sent",
  "gift_confirmed",
  "gift_cancelled",
] as const;

export type NotificationKind = (typeof notificationKinds)[number];
export const NotificationKindSchema = z.enum(notificationKinds);
// /notifications/{notificationId}
export type NotificationType = {
  id: string;
  userId: string;
  kind: NotificationKind;
  actorId: string;
  actorName: string;
  actorPhotoURL?: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
  postId?: string;
  commentId?: string;
};

export const NotificationSchema = z.object({
  userId: z.string(),
  kind: NotificationKindSchema,
  actorId: z.string(),
  actorName: z.string(),
  actorPhotoURL: z.string().optional(),
  message: z.string(),
  isRead: z.boolean(),
  postId: z.string().optional(),
  commentId: z.string().optional(),
});
export type NotificationSchemaType = z.infer<typeof NotificationSchema>;