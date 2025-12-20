import { useAuth } from "@/hooks/use-auth";
import { type DeliveryMethod, type PostType } from "@/lib/types";
import AvailableDialogAuthor from "./modals/author/available";
import ReceivedDialogAuthor from "./modals/author/received";
import ReservedDialogAuthor from "./modals/author/reserved";
import SentDeliveredDialogAuthor from "./modals/author/sent-delivered";
import ShippedDialogAuthor from "./modals/author/shipped";
import EGiftDialog from "./modals/e-gift";
import GiftedDialogOthers from "./modals/gifted";
import DeliveredDialog from "./modals/gifter/delivered";
import LabelCreatedDialog from "./modals/gifter/label-created";
import ReceivedDialog from "./modals/gifter/received";
import SentDialog from "./modals/gifter/sent";
import ShippedDialog from "./modals/gifter/shipped";
import ReserveDialog from "./modals/reserve";
import ReservedDialogOthers from "./modals/reserved";
import ShipLabelDialog from "./modals/ship-label";

export const GIFT_BUTTON_SIZE = {
  XS: "xs",
  SM: "sm",
} as const;

export type GiftButtonSize =
  (typeof GIFT_BUTTON_SIZE)[keyof typeof GIFT_BUTTON_SIZE];

const SIZE_CONFIG: Record<
  GiftButtonSize,
  {
    btn: string;
    icon: string;
    gap: string;
  }
> = {
  xs: {
    btn: "btn-xs",
    icon: "size-3",
    gap: "gap-1",
  },
  sm: {
    btn: "btn-sm",
    icon: "size-4",
    gap: "gap-1.5",
  },
};

export interface GiftButtonProps {
  post: PostType;
  /** Button size variant */
  size?: GiftButtonSize;
  /** Additional class names */
  className?: string;
}

export default function GiftActionButton({
  post,
  size = "sm",
}: GiftButtonProps) {
  const user = useAuth();

  const isGifter = user?.uid === post?.gift?.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;
  const deliveryMethod = post?.gift?.deliveryMethod;

  const sizeConfig = SIZE_CONFIG[size];

  // ================================================================
  // Author's View (Recipient)
  // ================================================================
  if (isAuthor) {
    return (
      <AuthorView
        post={post}
        sizeConfig={sizeConfig}
        deliveryMethod={deliveryMethod}
      />
    );
  }

  // ================================================================
  // Gifter's View (when they reserved the gift)
  // ================================================================
  if (isGifter) {
    return (
      <GifterView
        post={post}
        sizeConfig={sizeConfig}
        deliveryMethod={deliveryMethod}
      />
    );
  }

  // ================================================================
  // Other Users' View (not author, not gifter)
  // ================================================================
  return <OthersView post={post} sizeConfig={sizeConfig} />;
}

// =============================================================================
// Author View Component
// =============================================================================

interface ViewProps {
  post: PostType;
  sizeConfig: (typeof SIZE_CONFIG)[GiftButtonSize];
  deliveryMethod?: DeliveryMethod;
}

function AuthorView({ post, sizeConfig, deliveryMethod }: ViewProps) {
  const status = post?.gift?.giftStatus;

  switch (status) {
    case "available":
      // Show "Available" badge - no action needed
      return <AvailableDialogAuthor sizeConfig={sizeConfig} />;

    case "reserved":
    case "label_created":
      // Someone reserved it - show teaser without revealing who
      return <ReservedDialogAuthor sizeConfig={sizeConfig} />;

    case "shipped":
      // Package is on the way
      return <ShippedDialogAuthor sizeConfig={sizeConfig} />;

    case "sent":
    case "delivered":
      // Gift arrived - author can confirm receipt
      return (
        <SentDeliveredDialogAuthor
          post={post}
          sizeConfig={sizeConfig}
          deliveryMethod={deliveryMethod}
        />
      );

    case "received":
    case "thanked":
      // Author confirmed receipt
      //   showed whenever author confirms that they received the gift;
      // Show general info
      //   Mark as Your Gift
      return <ReceivedDialogAuthor post={post} sizeConfig={sizeConfig} />;

    default:
      return null;
  }
}

// =============================================================================
// Gifter View Component
// =============================================================================

function GifterView({ post, sizeConfig, deliveryMethod }: ViewProps) {
  const status = post?.gift?.giftStatus;

  switch (status) {
    // ----- RESERVED STATE -----
    case "reserved":
      // Gifter needs to proceed with their chosen delivery method
      // Or they can change/cancel from the ReserveDialog
      return (
        <ReservedGifterView
          post={post}
          sizeConfig={sizeConfig}
          deliveryMethod={deliveryMethod}
        />
      );

    // ----- SHIP_LABEL SPECIFIC STATES -----
    case "label_created":
      // Label ready, waiting to ship
      // show the details, allow to void the label or change it. cancel and reselect the delivery method, or confirm shipped
      return <LabelCreatedDialog post={post} sizeConfig={sizeConfig} />;

    case "shipped":
      // Package in transit
      // just show the package info and traking number (tracking rpogress?), allow to cancel the shipped status;
      return <ShippedDialog post={post} sizeConfig={sizeConfig} />;

    case "delivered":
      // Carrier confirmed delivery, waiting for recipient confirmation
      // Only if delivery method was ship_label
      // Show info from carrier and message, that awaiting confirmation from receiver (let them know we sent a reminder)
      return <DeliveredDialog post={post} sizeConfig={sizeConfig} />;

    // ----- SENT STATE (e_gift or in_person) -----
    //   Showed if delivery method was e-gift or in person
    // if in person - confirms that was sent and can cancel (back to reserve)
    // if was sent as e-gift - just show the info
    case "sent":
      return (
        <SentDialog
          post={post}
          sizeConfig={sizeConfig}
          deliveryMethod={deliveryMethod}
        />
      );

    // ----- COMPLETED STATES -----\

    case "received":
    case "thanked":
      return <ReceivedDialog post={post} sizeConfig={sizeConfig} />;

    default:
      return null;
  }
}

/**
 * Sub-component for gifter's reserved state
 * Shows different dialogs based on delivery method
 */
function ReservedGifterView({ post, sizeConfig, deliveryMethod }: ViewProps) {
  // If no delivery method set yet, show the reserve dialog to select one
  if (!deliveryMethod) {
    return <ReserveDialog post={post} sizeConfig={sizeConfig} />;
  }

  // Based on delivery method, show the appropriate next step
  switch (deliveryMethod) {
    case "ship_label":
      // Show shipping label creation flow
      // This dialog should allow: create label, change method, cancel
      return <ShipLabelDialog post={post} sizeConfig={sizeConfig} />;

    case "e_gift":
      // Show e-gift sending flow
      // This dialog should allow: send e-gift, change method, cancel
      return <EGiftDialog post={post} sizeConfig={sizeConfig} />;

    case "in_person":
      // Show in-person delivery flow
      // This dialog should allow: mark as sent, change method, cancel reservation
      return <InPersonDialog post={post} sizeConfig={sizeConfig} />;

    default:
      // Fallback to reserve dialog if something unexpected
      return <ReserveDialog post={post} sizeConfig={sizeConfig} />;
  }
}

// =============================================================================
// Others View Component (not author, not gifter)
// =============================================================================

function OthersView({ post, sizeConfig }: Omit<ViewProps, "deliveryMethod">) {
  const status = post?.gift?.giftStatus || "available";

  switch (status) {
    case "available":
      // Can reserve this gift
      return <ReserveDialog post={post} sizeConfig={sizeConfig} />;

    case "reserved":
    case "label_created":
    case "shipped":
    case "sent":
      // Someone else reserved it
      return <ReservedDialogOthers sizeConfig={sizeConfig} />;

    case "delivered":
    case "received":
    case "thanked":
      // Already gifted
      return <GiftedDialogOthers sizeConfig={sizeConfig} />;

    default:
      return null;
  }
}
