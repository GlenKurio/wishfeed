import { useAuth } from "@/hooks/use-auth";
import { type PostType } from "@/lib/types";
import { useRef } from "react";

// Author dialogs
import AvailableDialogAuthor from "./modals/author/available";
import ReceivedDialogAuthor from "./modals/author/received";
import ReservedDialogAuthor from "./modals/author/reserved";
import SentDeliveredDialogAuthor from "./modals/author/sent-delivered";
import ShippedDialogAuthor from "./modals/author/shipped";

// Gifter dialogs
import DeliveredDialog from "./modals/gifter/delivered";
import LabelCreatedDialog from "./modals/gifter/label-created";
import ReceivedDialog from "./modals/gifter/received";
import SentDialog from "./modals/gifter/sent";
import ShippedDialog from "./modals/gifter/shipped";

// Shared dialogs
import EGiftDialog from "./modals/e-gift";

import GiftedDialogOthers from "./modals/gifted";
import ReserveDialog from "./modals/reserve";
import ReservedDialogOthers from "./modals/reserved";
import ShipLabelDialog from "./modals/ship-label";
import type { DialogHandle, GiftButtonProps } from "./dialog-types";
import ConfirmSentDialog from "./modals/confirm-sent";

export default function GiftActionButton({
  post,
  size = "sm",
}: GiftButtonProps) {
  const user = useAuth();

  // Dialog refs for navigation
  const reserveDialogRef = useRef<DialogHandle>(null);
  const shipLabelDialogRef = useRef<DialogHandle>(null);
  const eGiftDialogRef = useRef<DialogHandle>(null);
  const confirmSentDialogRef = useRef<DialogHandle>(null);

  const isGifter = user?.uid === post?.gift?.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;
  const deliveryMethod = post?.gift?.deliveryMethod;
  const status = post?.gift?.giftStatus;

  // ================================================================
  // Navigation Handlers
  // ================================================================

  const handleGoBackToReserve = () => {
    reserveDialogRef.current?.open();
  };

  const handleNavigateToShipLabel = () => {
    shipLabelDialogRef.current?.open();
  };

  const handleNavigateToEGift = () => {
    eGiftDialogRef.current?.open();
  };

  // ================================================================
  // Author's View (Recipient)
  // ================================================================
  if (isAuthor) {
    switch (status) {
      case "available":
        return <AvailableDialogAuthor size={size} />;

      case "reserved":
      case "label_created":
        return <ReservedDialogAuthor size={size} />;

      case "shipped":
        return <ShippedDialogAuthor size={size} />;

      case "sent":
      case "delivered":
        return (
          <SentDeliveredDialogAuthor
            post={post}
            size={size}
            deliveryMethod={deliveryMethod}
          />
        );

      case "received":
      case "thanked":
        return <ReceivedDialogAuthor post={post} size={size} />;

      default:
        return null;
    }
  }

  // ================================================================
  // Gifter's View (when they reserved the gift)
  // ================================================================
  if (isGifter) {
    return (
      <GifterDialogs
        post={post}
        size={size}
        status={status}
        deliveryMethod={deliveryMethod}
        reserveDialogRef={reserveDialogRef}
        shipLabelDialogRef={shipLabelDialogRef}
        eGiftDialogRef={eGiftDialogRef}
        confirmSentDialogRef={confirmSentDialogRef}
        onGoBackToReserve={handleGoBackToReserve}
        onNavigateToShipLabel={handleNavigateToShipLabel}
        onNavigateToEGift={handleNavigateToEGift}
      />
    );
  }

  // ================================================================
  // Other Users' View (not author, not gifter)
  // ================================================================
  switch (status) {
    case "available":
      return <ReserveDialog ref={reserveDialogRef} post={post} size={size} />;

    case "reserved":
    case "label_created":
    case "shipped":
    case "sent":
      return <ReservedDialogOthers size={size} />;

    case "delivered":
    case "received":
    case "thanked":
      return <GiftedDialogOthers size={size} />;

    default:
      return null;
  }
}

// ================================================================
// Gifter Dialogs Component
// ================================================================
// Renders all dialogs the gifter might need, shows the appropriate trigger

interface GifterDialogsProps {
  post: PostType;
  size: "xs" | "sm";
  status: string | undefined;
  deliveryMethod: string | undefined;
  reserveDialogRef: React.RefObject<DialogHandle | null>;
  shipLabelDialogRef: React.RefObject<DialogHandle | null>;
  eGiftDialogRef: React.RefObject<DialogHandle | null>;
  confirmSentDialogRef: React.RefObject<DialogHandle | null>;
  onGoBackToReserve: () => void;
  onNavigateToShipLabel: () => void;
  onNavigateToEGift: () => void;
}

function GifterDialogs({
  post,
  size,
  status,
  deliveryMethod,
  reserveDialogRef,
  shipLabelDialogRef,
  eGiftDialogRef,
  confirmSentDialogRef,
  onGoBackToReserve,
  onNavigateToShipLabel,
  onNavigateToEGift,
}: GifterDialogsProps) {
  // Determine which dialog should show its trigger button
  const getVisibleDialog = ():
    | "reserve"
    | "ship_label"
    | "e_gift"
    | "in_person"
    | "other" => {
    if (status === "reserved") {
      if (!deliveryMethod) return "reserve";
      return deliveryMethod as "ship_label" | "e_gift" | "in_person";
    }
    return "other";
  };

  const visibleDialog = getVisibleDialog();

  // For non-reserved states, render the appropriate single dialog
  if (status !== "reserved") {
    switch (status) {
      case "label_created":
        return <LabelCreatedDialog post={post} size={size} />;
      case "shipped":
        return <ShippedDialog post={post} size={size} />;
      case "delivered":
        return <DeliveredDialog post={post} size={size} />;
      case "sent":
        return (
          <SentDialog post={post} size={size} deliveryMethod={deliveryMethod} />
        );
      case "received":
      case "thanked":
        return <ReceivedDialog post={post} size={size} />;
      default:
        return null;
    }
  }

  // For reserved state, render all navigation-related dialogs
  // Only one shows its trigger, others are hidden but accessible via refs
  return (
    <>
      {/* Reserve Dialog */}
      <ReserveDialog
        ref={reserveDialogRef}
        post={post}
        size={size}
        hideTrigger={visibleDialog !== "reserve"}
        onNavigateToShipLabel={onNavigateToShipLabel}
        onNavigateToEGift={onNavigateToEGift}
      />

      {/* Ship Label Dialog */}
      <ShipLabelDialog
        ref={shipLabelDialogRef}
        post={post}
        size={size}
        hideTrigger={visibleDialog !== "ship_label"}
        onGoBack={onGoBackToReserve}
      />

      {/* E-Gift Dialog */}
      <EGiftDialog
        ref={eGiftDialogRef}
        post={post}
        size={size}
        hideTrigger={visibleDialog !== "e_gift"}
        onGoBack={onGoBackToReserve}
      />

      <ConfirmSentDialog
        ref={confirmSentDialogRef}
        onGoBack={onGoBackToReserve}
        hideTrigger={visibleDialog !== "in_person"}
        post={post}
      />
    </>
  );
}
