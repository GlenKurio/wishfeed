import { useAuth } from "@/hooks/use-auth";
import { type PostType } from "@/lib/types";
import { useCallback, useRef, useState } from "react";

// Author dialogs
import AvailableDialogAuthor from "./dialogs/author/available";
import ReceivedDialogAuthor from "./dialogs/author/received";
import ReservedDialogAuthor from "./dialogs/author/reserved";
import SentDeliveredDialogAuthor from "./dialogs/author/sent-delivered";

// Gifter dialogs
import DeliveredDialog from "./dialogs/gifter/delivered";
import LabelCreatedDialog from "./dialogs/gifter/label-created";
import ReceivedDialog from "./dialogs/gifter/received";
import SentDialog from "./dialogs/gifter/sent";

// Shared dialogs
import type {
  CancelDialogSource,
  DialogHandle,
  GiftButtonProps,
} from "./dialogs/dialogs-utils";
import CancelReservationDialog from "./dialogs/gifter/cancel-reservation";
import ConfirmSentDialog from "./dialogs/gifter/confirm-sent";
import MarkShippedDialog from "./dialogs/gifter/mark-shipped";
import EGiftDialog from "./dialogs/gifter/send-e-gift";
import GiftedDialogOthers from "./dialogs/others-gifted";
import ReservedDialogOthers from "./dialogs/others-reserved";
import ReserveDialog from "./dialogs/reserve";

export default function GiftActionButton({
  post,
  size = "sm",
}: GiftButtonProps) {
  const user = useAuth();

  // Dialog refs for navigation
  const reserveDialogRef = useRef<DialogHandle>(null);
  const eGiftDialogRef = useRef<DialogHandle>(null);
  const confirmSentDialogRef = useRef<DialogHandle>(null);
  const cancelReservationDialogRef = useRef<DialogHandle>(null);

  // Track which dialog opened the cancel dialog
  const [cancelDialogSource, setCancelDialogSource] =
    useState<CancelDialogSource>(null);

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

  const handleNavigateToEGift = () => {
    eGiftDialogRef.current?.open();
  };

  // Open cancel dialog and track the source
  const handleOpenCancelDialog = useCallback((source: CancelDialogSource) => {
    setCancelDialogSource(source);
    cancelReservationDialogRef.current?.open();
  }, []);

  // Go back from cancel dialog to the source dialog
  const handleGoBackFromCancel = useCallback(() => {
    cancelReservationDialogRef.current?.close();

    // Small delay to ensure cancel dialog is closed first
    setTimeout(() => {
      switch (cancelDialogSource) {
        case "reserve":
          reserveDialogRef.current?.open();
          break;

        case "e_gift":
          eGiftDialogRef.current?.open();
          break;
        case "confirm_sent":
          confirmSentDialogRef.current?.open();
          break;
      }
      setCancelDialogSource(null);
    }, 150);
  }, [cancelDialogSource]);

  // ================================================================
  // Author's View (Recipient)
  // ================================================================
  if (isAuthor) {
    switch (status) {
      case "available":
        return <AvailableDialogAuthor size={size} />;

      case "reserved":
        return <ReservedDialogAuthor size={size} />;

      case "sent":
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
        eGiftDialogRef={eGiftDialogRef}
        confirmSentDialogRef={confirmSentDialogRef}
        onGoBackToReserve={handleGoBackToReserve}
        onNavigateToEGift={handleNavigateToEGift}
        cancelReservationDialogRef={cancelReservationDialogRef}
        onOpenCancelDialog={handleOpenCancelDialog}
        onGoBackFromCancel={handleGoBackFromCancel}
      />
    );
  }

  // ================================================================
  // Other Users' View (not author, not gifter)
  // ================================================================
  switch (status) {
    case "available":
      // Use GifterDialogs to render all dialogs needed for the gift flow
      return (
        <>
          <ReserveDialog
            ref={reserveDialogRef}
            post={post}
            size={size}
            hideTrigger={false}
            onNavigateToEGift={handleNavigateToEGift}
            onOpenCancelDialog={() => handleOpenCancelDialog("reserve")}
          />
        </>
      );

    case "reserved":
    case "sent":
      return <ReservedDialogOthers size={size} />;

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
  eGiftDialogRef: React.RefObject<DialogHandle | null>;
  confirmSentDialogRef: React.RefObject<DialogHandle | null>;
  cancelReservationDialogRef: React.RefObject<DialogHandle | null>;
  onGoBackToReserve: () => void;
  onNavigateToEGift: () => void;
  onOpenCancelDialog: (source: CancelDialogSource) => void;
  onGoBackFromCancel: () => void;
}

function GifterDialogs({
  post,
  size,
  status,
  deliveryMethod,
  reserveDialogRef,
  eGiftDialogRef,
  confirmSentDialogRef,
  cancelReservationDialogRef,
  onGoBackToReserve,
  onNavigateToEGift,
  onOpenCancelDialog,
  onGoBackFromCancel,
}: GifterDialogsProps) {
  // Determine which dialog should show its trigger button
  const getVisibleDialog = (): "reserve" | "e_gift" | "in_person" => {
    // For "available" status, always show reserve dialog
    if (status === "available") {
      return "reserve";
    }

    // For "reserved" status, show based on delivery method
    if (status === "reserved") {
      if (!deliveryMethod) return "reserve";
      return deliveryMethod as "e_gift" | "in_person";
    }

    // Default to reserve
    return "reserve";
  };

  const visibleDialog = getVisibleDialog();

  // For states other than "available" and "reserved", render single dialog
  if (status !== "reserved" && status !== "available") {
    switch (status) {
      case "label_created":
        return <LabelCreatedDialog post={post} size={size} />;
      case "shipped":
        return <MarkShippedDialog post={post} size={size} />;
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

  // For "available" and "reserved" states, render all navigation-related dialogs
  // Only one shows its trigger, others are hidden but accessible via refs
  return (
    <>
      {/* Reserve Dialog */}
      <ReserveDialog
        ref={reserveDialogRef}
        post={post}
        size={size}
        hideTrigger={visibleDialog !== "reserve"}
        onNavigateToEGift={onNavigateToEGift}
        onOpenCancelDialog={() => onOpenCancelDialog("reserve")}
      />

      {/* E-Gift Dialog */}
      <EGiftDialog
        ref={eGiftDialogRef}
        post={post}
        size={size}
        hideTrigger={visibleDialog !== "e_gift"}
        onGoBack={onGoBackToReserve}
        onOpenCancelDialog={() => onOpenCancelDialog("e_gift")}
      />

      {/* In-Person / Confirm Sent Dialog */}
      <ConfirmSentDialog
        ref={confirmSentDialogRef}
        post={post}
        hideTrigger={visibleDialog !== "in_person"}
        onGoBack={onGoBackToReserve}
        onOpenCancelDialog={() => onOpenCancelDialog("confirm_sent")}
      />

      <CancelReservationDialog
        ref={cancelReservationDialogRef}
        post={post}
        hideTrigger
        onGoBack={onGoBackFromCancel}
      />
    </>
  );
}
