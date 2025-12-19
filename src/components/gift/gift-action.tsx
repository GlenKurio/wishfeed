import { useAuth } from "@/hooks/use-auth";
import type { PostType } from "@/lib/types";
import ReceivedDialogAuthor from "./modals/author/received";
import ReservedDialogAuthor from "./modals/author/reserved";
import SentDeliveredDialogAuthor from "./modals/author/sent-delivered";
import ShippedDialogAuthor from "./modals/author/shipped";
import GiftedDialogOthers from "./modals/gifted";
import DeliveredDialog from "./modals/gifter/delivered";
import LabelCreatedDialog from "./modals/gifter/label-created";
import ReceivedDialog from "./modals/gifter/received";
import SentDialog from "./modals/gifter/sent";
import ShippedDialog from "./modals/gifter/shipped";
import ReserveDialog from "./modals/reserve";
import ReservedDialogOthers from "./modals/reserved";
import AvailableDialogAuthor from "./modals/author/available";

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

  const isGifter = user?.uid === post.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;

  const sizeConfig = SIZE_CONFIG[size];

  // ================================================================
  // Author's View (Recipient)
  // ================================================================
  if (isAuthor) {
    switch (post.giftStatus) {
      case "available":
        return <AvailableDialogAuthor />;

      case "reserved":
        return <ReservedDialogAuthor />;

      case "shipped":
        return <ShippedDialogAuthor />;

      case "sent":
      case "delivered":
        return <SentDeliveredDialogAuthor />;

      case "received":
      case "thanked":
        return <ReceivedDialogAuthor />;

      default:
        return null;
    }
  }

  // ================================================================
  // Gifter's View (when they reserved the gift)
  // ================================================================
  if (isGifter) {
    switch (post.giftStatus) {
      case "reserved":
        // Cancel, continue with selected delivery method or change the delivery method
        //   Use reserveDialog but check in it if gift is laredy reserver and add action to change the delivery method or cancel the reservation
        return <ReserveDialog post={post} sizeConfig={sizeConfig} />;

      case "label_created":
        // show the details, allow to void the label or change it. cancel and reselect the delivery method, or confirm shipped
        return <LabelCreatedDialog />;

      case "shipped":
        // just show the package info and traking number (tracking rpogress?), allow to cancel the shipped status;
        return <ShippedDialog />;

      case "sent":
        //   Showed if delivery method was e-gift or in person
        // if in person - can cancel (back to reserved)
        // if was sent as e-gift - just show the info
        return <SentDialog />;

      case "delivered":
        // Only if delivery method was ship_label
        // Show info from carrier and message, that awaiting confirmation from receiver (let them know we sent a reminder)
        return <DeliveredDialog />;

      case "received":
      case "thanked":
        //   showed whenever author confirms that they received the gift;
        // Show general info
        //   Mark as Your Gift
        return <ReceivedDialog />;

      default:
        return null;
    }
  }

  // ================================================================
  // Other Users' View (not author, not gifter)
  // ================================================================
  switch (post.giftStatus) {
    case "available":
      return <ReserveDialog post={post} sizeConfig={sizeConfig} />;

    case "reserved":
    case "label_created":
    case "shipped":
    case "sent":
      // Someone else reserved it - show unavailable state
      return <ReservedDialogOthers />;

    case "delivered":
    case "received":
    case "thanked":
      // Already gifted by someone else
      return <GiftedDialogOthers />;

    default:
      return null;
  }
}
