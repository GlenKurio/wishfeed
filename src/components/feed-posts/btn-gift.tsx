import { useAuth } from "@/hooks/use-auth";
import type { GiftModalKind, PostType } from "@/lib/types";
import {
  IconCheck,
  IconClock,
  IconGift,
  IconX,
  IconTruck,
  IconPackage,
} from "@tabler/icons-react";
import { useState, type MouseEvent } from "react";
import { GiftActionModal } from "./btn-gift-modal";

// =============================================================================
// Types
// =============================================================================

export const GIFT_BUTTON_SIZE = {
  XS: "xs",
  SM: "sm",
  MD: "md",
} as const;

export type GiftButtonSize =
  (typeof GIFT_BUTTON_SIZE)[keyof typeof GIFT_BUTTON_SIZE];

export interface GiftButtonProps {
  post: PostType;
  /** Button size variant */
  size?: GiftButtonSize;
  /** If true, stops click propagation (useful inside clickable cards) */
  stopPropagation?: boolean;
  /** Called when any action is triggered (optional, for analytics/tracking) */
  onAction?: (action: GiftModalKind) => void;
  /** Additional class names */
  className?: string;
}

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
  md: {
    btn: "btn-md",
    icon: "size-5",
    gap: "gap-2",
  },
};

// =============================================================================
// Component
// =============================================================================

export default function GiftButton({
  post,
  size = "sm",
  stopPropagation = false,
  onAction,
  className = "",
}: GiftButtonProps) {
  const user = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<GiftModalKind>("reserve");

  const isGifter = user?.uid === post.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;

  const sizeConfig = SIZE_CONFIG[size];

  // Handle click with optional propagation stop
  const handleClick = (e: MouseEvent, kind: GiftModalKind) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (isModalOpen) return;

    onAction?.(kind);
    setModalKind(kind);
    setIsModalOpen(true);
  };

  // Prevent propagation on non-action clicks (like disabled buttons)
  const handleNonActionClick = (e: MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  // Base button classes
  const btnBase = `btn ${sizeConfig.btn} ${sizeConfig.gap} ${className}`;

  // =============================================================================
  // Author's View (Recipient)
  // =============================================================================

  if (isAuthor) {
    switch (post.giftStatus) {
      case "available":
        return (
          <div
            className={`${btnBase} btn-ghost cursor-default`}
            onClick={handleNonActionClick}
          >
            <IconGift className={`${sizeConfig.icon} opacity-50`} />
            <span className="opacity-50">Available</span>
          </div>
        );
      // TODO: based on "gifting method" show diffrent messages?
      case "reserved":
        return (
          <div
            className={`${btnBase} btn-warning btn-soft cursor-default`}
            onClick={handleNonActionClick}
          >
            <IconClock className={sizeConfig.icon} />
            <span>🎁 Surprise incoming!</span>
          </div>
        );

      case "shipped":
        return (
          <div
            className={`${btnBase} btn-info btn-soft cursor-default`}
            onClick={handleNonActionClick}
          >
            <IconTruck className={sizeConfig.icon} />
            <span>On its way!</span>
          </div>
        );

      case "delivered":
      case "sent":
        return (
          <>
            <button
              onClick={(e) => handleClick(e, "confirmReceipt")}
              className={`${btnBase} btn-success`}
            >
              <IconCheck className={sizeConfig.icon} />
              <span>Confirm Receipt</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalKind={modalKind}
              post={post}
            />
          </>
        );

      case "received":
        return (
          <>
            <button
              onClick={(e) => handleClick(e, "revertToSent")}
              className={`${btnBase} btn-success btn-soft`}
            >
              <IconCheck className={sizeConfig.icon} />
              <span>Received</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalKind={modalKind}
              post={post}
            />
          </>
        );

      default:
        return null;
    }
  }

  // =============================================================================
  // Gifter's View (when they reserved the gift)
  // =============================================================================

  if (isGifter) {
    switch (post.giftStatus) {
      // TODO: based on "gifting method" show diffrent messages and trigger different dialogs if initial process was interrupted
      case "reserved":
        return (
          <>
            <div className="flex gap-2" onClick={handleNonActionClick}>
              <button
                onClick={(e) => handleClick(e, "markAsSent")}
                className={`${btnBase} btn-success`}
              >
                <IconCheck className={sizeConfig.icon} />
                <span>Mark as Sent</span>
              </button>
              <button
                onClick={(e) => handleClick(e, "cancel")}
                className={`btn ${sizeConfig.btn} btn-ghost`}
                title="Cancel reservation"
              >
                <IconX className={sizeConfig.icon} />
              </button>
            </div>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalKind={modalKind}
              post={post}
            />
          </>
        );

      case "shipped":
        return (
          <>
            <button
              onClick={(e) => handleClick(e, "viewTracking")}
              className={`${btnBase} btn-info btn-soft`}
            >
              <IconTruck className={sizeConfig.icon} />
              <span>Track Package</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalKind={modalKind}
              post={post}
            />
          </>
        );

      case "sent":
        return (
          <>
            <button
              onClick={(e) => handleClick(e, "revertToReserved")}
              className={`${btnBase} btn-success btn-soft`}
            >
              <IconPackage className={sizeConfig.icon} />
              <span>Sent</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalKind={modalKind}
              post={post}
            />
          </>
        );

      case "delivered":
        return (
          <div
            className={`${btnBase} btn-success btn-soft cursor-default`}
            onClick={handleNonActionClick}
          >
            <IconCheck className={sizeConfig.icon} />
            <span>Delivered</span>
          </div>
        );

      case "received":
        return (
          <div
            className={`${btnBase} btn-success cursor-default`}
            onClick={handleNonActionClick}
          >
            <IconCheck className={sizeConfig.icon} />
            <span>Your Gift ✨</span>
          </div>
        );

      default:
        return null;
    }
  }

  // =============================================================================
  // Other Users' View (not author, not gifter)
  // =============================================================================

  switch (post.giftStatus) {
    case "available":
      return (
        <>
          <button
            onClick={(e) => handleClick(e, "reserve")}
            className={`${btnBase} btn-primary`}
          >
            <IconGift className={sizeConfig.icon} />
            <span>Gift This</span>
          </button>

          <GiftActionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            modalKind={modalKind}
            post={post}
          />
        </>
      );

    case "reserved":
    case "label_created":
    case "shipped":
    case "sent":
      // Someone else reserved it - show unavailable state
      return (
        <div
          className={`${btnBase} btn-ghost cursor-default opacity-50`}
          onClick={handleNonActionClick}
        >
          <IconClock className={sizeConfig.icon} />
          <span>Reserved</span>
        </div>
      );

    case "delivered":
    case "received":
    case "thanked":
      // Already gifted by someone else
      return (
        <div
          className={`${btnBase} btn-ghost cursor-default opacity-50`}
          onClick={handleNonActionClick}
        >
          <IconCheck className={sizeConfig.icon} />
          <span>Gifted</span>
        </div>
      );

    default:
      return null;
  }
}

// =============================================================================
// Compact variant for tight spaces (just icon, tooltip for text)
// =============================================================================

export function GiftButtonCompact({
  post,
  size = "sm",
  stopPropagation = false,
  onAction,
  className = "",
}: GiftButtonProps) {
  const user = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<GiftModalKind>("reserve");

  const isGifter = user?.uid === post.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;

  const sizeConfig = SIZE_CONFIG[size];

  const handleClick = (e: MouseEvent, type: GiftModalKind) => {
    if (stopPropagation) e.stopPropagation();
    if (isModalOpen) return;
    onAction?.(type);
    setModalKind(type);
    setIsModalOpen(true);
  };

  const handleNonActionClick = (e: MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
  };

  const btnBase = `btn ${sizeConfig.btn} btn-square ${className}`;

  // Determine icon and tooltip based on status and role
  const getIconAndTooltip = (): {
    icon: React.ReactNode;
    tooltip: string;
    btnClass: string;
    action?: GiftModalKind;
  } | null => {
    if (isAuthor) {
      switch (post.giftStatus) {
        case "available":
          return {
            icon: <IconGift className={`${sizeConfig.icon} opacity-50`} />,
            tooltip: "Available",
            btnClass: "btn-ghost cursor-default",
          };
        case "reserved":
          return {
            icon: <IconClock className={sizeConfig.icon} />,
            tooltip: "Surprise incoming!",
            btnClass: "btn-warning btn-soft cursor-default",
          };
        case "delivered":
        case "sent":
          return {
            icon: <IconCheck className={sizeConfig.icon} />,
            tooltip: "Confirm receipt",
            btnClass: "btn-success",
            action: "confirmReceipt",
          };
        case "received":
          return {
            icon: <IconCheck className={sizeConfig.icon} />,
            tooltip: "Received",
            btnClass: "btn-success btn-soft cursor-default",
          };
      }
    }

    if (isGifter) {
      switch (post.giftStatus) {
        case "reserved":
          return {
            icon: <IconPackage className={sizeConfig.icon} />,
            tooltip: "Mark as sent",
            btnClass: "btn-success",
            action: "markAsSent",
          };
        case "sent":
          return {
            icon: <IconPackage className={sizeConfig.icon} />,
            tooltip: "Sent",
            btnClass: "btn-success btn-soft cursor-default",
          };
        case "received":
          return {
            icon: <IconCheck className={sizeConfig.icon} />,
            tooltip: "Your gift",
            btnClass: "btn-success cursor-default",
          };
      }
    }

    // Other users
    switch (post.giftStatus) {
      case "available":
        return {
          icon: <IconGift className={sizeConfig.icon} />,
          tooltip: "Gift this",
          btnClass: "btn-primary",
          action: "reserve",
        };
      case "reserved":
      case "sent":
        return {
          icon: <IconClock className={sizeConfig.icon} />,
          tooltip: "Reserved",
          btnClass: "btn-ghost cursor-default opacity-50",
        };
      case "received":
        return {
          icon: <IconCheck className={sizeConfig.icon} />,
          tooltip: "Gifted",
          btnClass: "btn-ghost cursor-default opacity-50",
        };
    }

    return null;
  };

  const config = getIconAndTooltip();
  if (!config) return null;

  return (
    <>
      <div className="tooltip tooltip-left" data-tip={config.tooltip}>
        {config.action ? (
          <button
            onClick={(e) => handleClick(e, config.action!)}
            className={`${btnBase} ${config.btnClass}`}
          >
            {config.icon}
          </button>
        ) : (
          <div
            className={`${btnBase} ${config.btnClass}`}
            onClick={handleNonActionClick}
          >
            {config.icon}
          </div>
        )}
      </div>

      <GiftActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalKind={modalKind}
        post={post}
      />
    </>
  );
}
