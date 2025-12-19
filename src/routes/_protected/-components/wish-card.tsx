import { GIFT_STATUS_CONFIG } from "@/lib/config";
import type { DeliveryMethod, GiftStatus, PostType } from "@/lib/types";
import {
  IconCheck,
  IconPhoto,
  IconX,
  IconGift,
  IconDotsVertical,
  IconExternalLink,
  IconTruck,
  IconMail,
  IconUsers,
} from "@tabler/icons-react";
import { useState, type ReactNode, type MouseEvent } from "react";

// =============================================================================
// Types & Constants
// =============================================================================

export const WISH_CARD_KIND = {
  /** For multi-select scenarios (e.g., selecting wishes for a collection) */
  SELECTABLE: "selectable",
  /** For removal scenarios (e.g., removing from a list) */
  REMOVABLE: "removable",
  /** For gift flow (e.g., showing gift status, actions) */
  GIFT: "gift",
  /** Simple display only, no actions */
  DISPLAY: "display",
  /** Compact view for lists */
  COMPACT: "compact",
} as const;

export type WishCardKind = (typeof WISH_CARD_KIND)[keyof typeof WISH_CARD_KIND];

export const WISH_CARD_SIZE = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export type WishCardSize = (typeof WISH_CARD_SIZE)[keyof typeof WISH_CARD_SIZE];

// Gift-specific types

interface GiftInfo {
  status: GiftStatus;
  method?: DeliveryMethod;
  gifterName?: string;
  recipientName?: string;
  date?: string;
}

// =============================================================================
// Props Types - Using discriminated unions for type safety
// =============================================================================

interface BaseProps {
  post: PostType;
  size?: WishCardSize;
  className?: string;
  disabled?: boolean;
}

interface SelectableProps extends BaseProps {
  kind: "selectable";
  isSelected: boolean;
  onToggle: (id: string) => void;
}

interface RemovableProps extends BaseProps {
  kind: "removable";
  onRemove: (id: string) => void;
  confirmRemove?: boolean;
}

interface GiftProps extends BaseProps {
  kind: "gift";
  giftInfo: GiftInfo;
  onGiftAction?: (id: string, action: string) => void;
  /** Who is viewing: 'gifter' or 'recipient' */
  viewAs?: "gifter" | "recipient";
}

interface DisplayProps extends BaseProps {
  kind: "display";
  onClick?: (id: string) => void;
  showExternalLink?: boolean;
}

interface CompactProps extends BaseProps {
  kind: "compact";
  onClick?: (id: string) => void;
  trailing?: ReactNode;
}

export type WishCardProps =
  | SelectableProps
  | RemovableProps
  | GiftProps
  | DisplayProps
  | CompactProps;

// =============================================================================
// Helper Components
// =============================================================================

function WishImage({
  src,
  alt,
  size,
}: {
  src?: string;
  alt: string;
  size: WishCardSize;
}) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = src && src !== "" && !imageError;

  const sizeClasses = {
    sm: "size-10 rounded-xl",
    md: "size-12 rounded-2xl",
    lg: "size-16 rounded-2xl",
  };

  const iconSizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  };

  if (hasValidImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} from-base-300 to-primary/30 flex items-center justify-center bg-linear-to-br`}
    >
      <IconPhoto className={`text-primary ${iconSizes[size]}`} />
    </div>
  );
}

function GiftMethodIcon({
  method,
  className,
}: {
  method: DeliveryMethod;
  className?: string;
}) {
  const icons = {
    ship_label: IconTruck,
    e_gift: IconMail,
    in_person: IconUsers,
  };
  const Icon = icons[method];
  return <Icon className={className} />;
}

function GiftStatusBadge({ status }: { status: GiftStatus }) {
  const { label, color, isTerminal } = GIFT_STATUS_CONFIG[status];

  return (
    <span
      className={`badge badge-sm badge-${color} ${!isTerminal ? "badge-outline" : ""}`}
    >
      {label}
    </span>
  );
}

// =============================================================================
// Action Components for each kind
// =============================================================================

function SelectableAction({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
        isSelected ? "border-primary bg-primary" : "border-base-content/20"
      }`}
    >
      {isSelected && <IconCheck className="text-primary-content h-3 w-3" />}
    </div>
  );
}

function RemovableAction({
  onRemove,
  disabled,
}: {
  onRemove: () => void;
  disabled?: boolean;
}) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-ghost btn-sm btn-circle btn-error"
      disabled={disabled}
      aria-label="Remove item"
    >
      <IconX className="h-4 w-4" />
    </button>
  );
}

function GiftAction({
  giftInfo,
  viewAs,
  onAction,
  disabled,
}: {
  giftInfo: GiftInfo;
  viewAs: "gifter" | "recipient";
  onAction?: (action: string) => void;
  disabled?: boolean;
}) {
  const handleActionClick = (e: MouseEvent, action: string) => {
    e.stopPropagation();
    onAction?.(action);
  };

  // Show different actions based on status and viewer
  if (giftInfo.status === "available" && viewAs === "gifter") {
    return (
      <button
        onClick={(e) => handleActionClick(e, "gift")}
        className="btn btn-primary btn-sm gap-1"
        disabled={disabled}
      >
        <IconGift className="h-4 w-4" />
        Gift
      </button>
    );
  }

  if (giftInfo.status === "delivered" && viewAs === "recipient") {
    return (
      <button
        onClick={(e) => handleActionClick(e, "confirm")}
        className="btn btn-success btn-sm gap-1"
        disabled={disabled}
      >
        <IconCheck className="h-4 w-4" />
        Confirm
      </button>
    );
  }

  // For other states, show a dropdown menu
  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm btn-square"
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
      >
        <IconDotsVertical className="h-4 w-4" />
      </button>
      <ul
        tabIndex={0}
        className="menu dropdown-content bg-base-100 rounded-box z-10 w-40 p-2 shadow-lg"
      >
        <li>
          <a onClick={(e) => handleActionClick(e as any, "view")}>
            View Details
          </a>
        </li>
        {giftInfo.status === "shipped" && (
          <li>
            <a onClick={(e) => handleActionClick(e as any, "track")}>
              Track Package
            </a>
          </li>
        )}
        {viewAs === "gifter" && giftInfo.status === "reserved" && (
          <li>
            <a
              onClick={(e) => handleActionClick(e as any, "cancel")}
              className="text-error"
            >
              Cancel Gift
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

function DisplayAction({
  showExternalLink,
  url,
}: {
  showExternalLink?: boolean;
  url?: string;
}) {
  if (!showExternalLink || !url) return null;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-ghost btn-sm btn-square"
      aria-label="Open external link"
    >
      <IconExternalLink className="h-4 w-4" />
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function WishCard(props: WishCardProps) {
  const { post, size = "md", className = "", disabled = false } = props;

  // Determine if card is clickable
  const isClickable =
    props.kind === "selectable" ||
    props.kind === "display" ||
    props.kind === "compact";

  // Handle card click
  const handleCardClick = () => {
    if (disabled) return;

    switch (props.kind) {
      case "selectable":
        props.onToggle(post.id!);
        break;
      case "display":
        props.onClick?.(post.id!);
        break;
      case "compact":
        props.onClick?.(post.id!);
        break;
    }
  };

  // Size-based styles
  const sizeStyles = {
    sm: "p-2 gap-2 rounded-2xl",
    md: "p-3 gap-3 rounded-3xl",
    lg: "p-4 gap-4 rounded-3xl",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Selection state (only for selectable kind)
  const isSelected = props.kind === "selectable" && props.isSelected;

  // Build card classes
  const cardClasses = [
    "flex w-full items-center border transition-all",
    sizeStyles[size],
    isSelected
      ? "border-primary bg-primary/10"
      : "border-base-content/10 bg-base-200",
    isClickable && !disabled
      ? "cursor-pointer hover:bg-base-300 active:scale-[0.99]"
      : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render action based on kind
  const renderAction = () => {
    switch (props.kind) {
      case "selectable":
        return <SelectableAction isSelected={props.isSelected} />;

      case "removable":
        return (
          <RemovableAction
            onRemove={() => props.onRemove(post.id!)}
            disabled={disabled}
          />
        );

      case "gift":
        return (
          <GiftAction
            giftInfo={props.giftInfo}
            viewAs={props.viewAs ?? "gifter"}
            onAction={(action) => props.onGiftAction?.(post.id!, action)}
            disabled={disabled}
          />
        );

      case "display":
        return (
          <DisplayAction
            showExternalLink={props.showExternalLink}
            url={post.wishUrlAffiliate}
          />
        );

      case "compact":
        return props.trailing ?? null;

      default:
        return null;
    }
  };

  // Render additional info for gift cards
  const renderGiftInfo = () => {
    if (props.kind !== "gift") return null;

    const { giftInfo, viewAs = "gifter" } = props;

    return (
      <div className="flex flex-wrap items-center gap-2">
        <GiftStatusBadge status={giftInfo.status} />
        {giftInfo.method && (
          <span className="badge badge-sm badge-ghost gap-1">
            <GiftMethodIcon method={giftInfo.method} className="h-3 w-3" />
            {giftInfo.method === "ship_label"
              ? "Shipping"
              : giftInfo.method === "e_gift"
                ? "E-Gift"
                : "In Person"}
          </span>
        )}
        {giftInfo.gifterName && viewAs === "recipient" && (
          <span className="text-base-content/60 text-xs">
            from {giftInfo.gifterName}
          </span>
        )}
        {giftInfo.recipientName && viewAs === "gifter" && (
          <span className="text-base-content/60 text-xs">
            to {giftInfo.recipientName}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={isClickable ? handleCardClick : undefined}
      className={cardClasses}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
    >
      <WishImage src={post.image} alt={post.title} size={size} />

      <div className="min-w-0 flex-1">
        <span
          className={`${textSizes[size]} text-base-content line-clamp-1 font-medium`}
        >
          {post.title}
        </span>
        {renderGiftInfo()}
        {props.kind === "display" && post.price && (
          <span className="text-base-content/60 text-xs">${post.price}</span>
        )}
      </div>

      {renderAction()}
    </div>
  );
}
