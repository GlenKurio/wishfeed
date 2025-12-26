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

/**
 * Gift-related fields that should be added to PostType
 * when a post is reserved/gifted
 */
export interface PostGiftFields {
  /** Current gift status */
  giftStatus: GiftStatus | "available";

  /** The gifter's info (when reserved) */
  gifter?: EmbeddedUser;
  /** When reservation for gift expires */
  expiresAt?: Timestamp | null;
  /** Delivery method chosen by gifter */
  deliveryMethod?: DeliveryMethod;

  /** Reference to the gift document ID */
  giftId?: string | null;
}

// /post/{postId}
export type PostType = {
  id: string;
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

  // TODO: update gifter data on user profile update
  gift: PostGiftFields;

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
  actorHandle: string;
  actorPhotoURL?: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expireAt: Timestamp;
  postId?: string;
  commentId?: string;
};

export const NotificationSchema = z.object({
  userId: z.string(),
  kind: NotificationKindSchema,
  actorId: z.string(),
  actorName: z
    .string()
    .max(50, { message: "Actor name cannot exceed 50 characters" }),
  actorHandle: z
    .string()
    .max(20, { message: "Actor name cannot exceed 20 characters" }),
  actorPhotoURL: z.string().optional(),
  message: z
    .string()
    .max(100, { message: "Message cannot exceed 100 characters" }),
  postId: z.string().optional(),
  commentId: z.string().optional(),
});
export type NotificationSchemaType = z.infer<typeof NotificationSchema>;

// =============================================================================
// GIFT
// =============================================================================

export const DELIVERY_METHODS = {
  SHIP_LABEL: "ship_label",
  E_GIFT: "e_gift",
  IN_PERSON: "in_person",
} as const;

export const deliveryMethods = [
  DELIVERY_METHODS.SHIP_LABEL,
  DELIVERY_METHODS.E_GIFT,
  DELIVERY_METHODS.IN_PERSON,
] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

export const GIFT_STATUS = {
  // Initial state
  AVAILABLE: "available",

  // Active states
  RESERVED: "reserved",
  LABEL_CREATED: "label_created", // For ship_label: label generated, not yet shipped
  SHIPPED: "shipped", // For ship_label: in transit
  SENT: "sent", // For e_gift/in_person: gifter marked as sent

  // Completion states
  DELIVERED: "delivered", // Carrier confirmed delivery (ship_label only)
  RECEIVED: "received", // Recipient confirmed receipt
  THANKED: "thanked", // Recipient sent thank you (optional final state)
} as const;

export const giftStatuses = Object.values(GIFT_STATUS);
export type GiftStatus = (typeof giftStatuses)[number];

/**
 * Embedded wish data - denormalized from the post
 * Updated via Cloud Function when post changes
 */
export interface EmbeddedPost {
  title: string;
  image?: string | null;
  brand?: string | null;
  price?: number | null;
  url?: string | null;
}

/**
 * Embedded user data - denormalized from user profile
 * Updated via Cloud Function when profile changes
 */
export interface EmbeddedUser {
  uid: string;
  displayName: string;
  handle: string;
  photoUrl?: string | null;
}

// =============================================================================
// E-Gift Types
// =============================================================================

export interface EGiftDelivery {
  /** Recipient email (if email delivery) */
  recipientEmail?: string | null;
  /** Gift code/voucher (if applicable) */
  giftCode?: string | null;
  /** URL to redeem (if applicable) */
  redeemUrl?: string | null;
  /** When the e-gift was delivered */
  deliveredAt?: Timestamp | null;
  /** Whether recipient has viewed/opened */
  viewedAt?: Timestamp | null;
}

// =============================================================================
// Shipping
// =============================================================================

export interface TrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: Timestamp;
}
export const packageDetailsSchema = z
  .object({
    // Weight
    weight: z
      .number({ message: "Weight must be a number" })
      .positive({ message: "Weight must be greater than 0" })
      .max(150, { message: "Weight cannot exceed 150 lbs" }),

    weightUnit: z.enum(["oz", "lb"], { message: "Weight unit is required" }),

    // Dimensions
    length: z
      .number({ message: "Length must be a number" })
      .positive({ message: "Length must be greater than 0" })
      .max(108, { message: "Length cannot exceed 108 inches" }),

    width: z
      .number({ message: "Width must be a number" })
      .positive({ message: "Width must be greater than 0" })
      .max(108, { message: "Width cannot exceed 108 inches" }),

    height: z
      .number({ message: "Height must be a number" })
      .positive({ message: "Height must be greater than 0" })
      .max(108, { message: "Height cannot exceed 108 inches" }),

    dimensionUnit: z.enum(["in", "cm"], {
      message: "Dimension unit is required",
    }),

    // Package type
    packageType: z.enum(
      [
        "custom",
        "usps_small",
        "usps_medium",
        "usps_large",
        "flat_rate_envelope",
      ],
      { message: "Package type is required" },
    ),

    // Shipping options
    requireSignature: z.boolean().default(false),

    insurance: z.boolean().default(false),

    insuranceValue: z
      .number()
      .positive({ message: "Insurance value must be greater than 0" })
      .max(10000, { message: "Insurance value cannot exceed $10,000" })
      .optional(),
  })
  .refine(
    (data) => {
      // If insurance is enabled, insuranceValue must be provided
      if (data.insurance && !data.insuranceValue) {
        return false;
      }
      return true;
    },
    {
      message: "Insurance value is required when insurance is enabled",
      path: ["insuranceValue"],
    },
  )
  .refine(
    (data) => {
      // Validate combined dimensions don't exceed carrier limits
      // Most carriers: Length + Girth (2×Width + 2×Height) ≤ 165 inches
      const lengthInInches =
        data.dimensionUnit === "cm" ? data.length / 2.54 : data.length;
      const widthInInches =
        data.dimensionUnit === "cm" ? data.width / 2.54 : data.width;
      const heightInInches =
        data.dimensionUnit === "cm" ? data.height / 2.54 : data.height;

      const girth = 2 * widthInInches + 2 * heightInInches;
      const combinedSize = lengthInInches + girth;

      return combinedSize <= 165;
    },
    {
      message:
        "Package exceeds maximum size (Length + Girth must be ≤ 165 inches)",
      path: ["length"],
    },
  );

export type PackageDetails = z.infer<typeof packageDetailsSchema>;

export type PackageType = PackageDetails["packageType"];
export type WeightUnit = PackageDetails["weightUnit"];
export type DimensionUnit = PackageDetails["dimensionUnit"];

export const shippingRateSchema = z.object({
  rateId: z.string(),
  carrier: z.string(),
  carrierCode: z.string(),
  service: z.string(),
  serviceCode: z.string(),
  rate: z.number().positive(),
  retailRate: z.number().positive().optional(),
  estimatedDays: z.number().int().positive(),
  deliveryDate: z.string().optional(),
  isGuaranteed: z.boolean(),
});

export type ShippingRate = z.infer<typeof shippingRateSchema>;

export interface ShippingInfo {
  packageDetails?: PackageDetails;

  // Selected rate (from ShipStation)
  selectedRate?: ShippingRate;

  // Payment info
  payment?: {
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: "pending" | "succeeded" | "failed";
    paidAt?: Timestamp;
  };

  // Label info (after creation)
  label?: {
    shipStationShipmentId: string;
    trackingNumber: string;
    carrier: string;
    labelUrl: string;
    createdAt: Timestamp;
  };

  // Tracking updates
  trackingHistory?: TrackingEvent[];

  lastTrackingUpdate?: Timestamp | null;
}

// /gifts/{giftId}
// =============================================================================
// Main Gift Type
// =============================================================================

export interface GiftType {
  id?: string;

  // === References ===
  postId: string;
  gifterId: string;
  recipientId: string;

  // === Denormalized Data ===
  post: EmbeddedPost;
  gifter: EmbeddedUser;
  recipient: EmbeddedUser;

  // === Core Status ===
  status: GiftStatus;
  deliveryMethod: DeliveryMethod;

  // === Lifecycle Timestamps ===
  reservedAt: Timestamp;
  expiresAt: Timestamp; // Auto-calculated: reservedAt + 30 days

  // Status transition timestamps (set when status changes)
  pendingShipmentAt?: Timestamp | null;
  labelCreatedAt?: Timestamp | null;
  shippedAt?: Timestamp | null;
  sentAt?: Timestamp | null;
  deliveredAt?: Timestamp | null;
  receivedAt?: Timestamp | null;
  thankedAt?: Timestamp | null;

  expiredAt?: Timestamp | null;

  // === Delivery Details ===
  shipping?: ShippingInfo | null;
  eGift?: EGiftDelivery | null;

  // === Messages & Notes ===
  /** Message from gifter to recipient (shown on delivery) */
  giftMessage?: string | null;
  /** Private notes for gifter (e.g., order confirmation, manual tracking) */
  gifterNotes?: string | null;
  /** Thank you message from recipient */
  thankYouMessage?: string | null;

  // === Privacy & Settings ===

  /** If true, this was marked as anonymous by gifter */
  isAnonymous: boolean;

  // === Reminder Tracking ===
  reminders: {
    /** Reminder to gifter to send the gift */
    sendReminderAt?: Timestamp | null;
    sendReminderSentAt?: Timestamp | null;
    /** Reminder to recipient to confirm receipt */
    confirmReminderAt?: Timestamp | null;
    confirmReminderSentAt?: Timestamp | null;
    /** Reminder before expiration */
    expirationWarningAt?: Timestamp | null;
    expirationWarningSentAt?: Timestamp | null;
  };

  // === Metadata ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Gift type for writing to Firestore
 * Allows FieldValue (serverTimestamp) for timestamp fields
 */
export interface GiftTypeWrite
  extends Omit<
    GiftType,
    | "reservedAt"
    | "expiresAt"
    | "pendingShipmentAt"
    | "labelCreatedAt"
    | "shippedAt"
    | "sentAt"
    | "deliveredAt"
    | "receivedAt"
    | "thankedAt"
    | "cancelledAt"
    | "expiredAt"
    | "createdAt"
    | "updatedAt"
    | "reminders"
  > {
  // Required timestamps that can use serverTimestamp()
  reservedAt: FieldValue;
  expiresAt: Timestamp; // This is calculated, so always a real Timestamp
  createdAt: FieldValue;
  updatedAt: FieldValue;

  // Optional timestamps
  pendingShipmentAt?: FieldValue | null;
  labelCreatedAt?: FieldValue | null;
  shippedAt?: FieldValue | null;
  sentAt?: FieldValue | null;
  deliveredAt?: FieldValue | null;
  receivedAt?: FieldValue | null;
  thankedAt?: FieldValue | null;
  cancelledAt?: FieldValue | null;
  expiredAt?: FieldValue | null;

  // Reminders with writable timestamps
  reminders: {
    sendReminderAt?: Timestamp | null;
    sendReminderSentAt?: FieldValue | null;
    confirmReminderAt?: Timestamp | null;
    confirmReminderSentAt?: FieldValue | null;
    expirationWarningAt?: Timestamp | null;
    expirationWarningSentAt?: FieldValue | null;
  };
}

export type GiftModalKind =
  | "reserve"
  | "markAsSent"
  | "confirmReceipt"
  | "cancel"
  | "revertToReserved"
  | "revertToSent";

export type GiftActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  modalKind: GiftModalKind;
  post: PostType;
};

// Zod schemas for froms validation

export const markAsReservedSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods, {
    message: "Delivery method must be one of the known ones.",
  }),
});

export const markAsSentSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods, {
    message: "Delivery method must be one of the known ones.",
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
