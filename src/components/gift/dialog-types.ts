import type { GiftType, PostType } from "@/lib/types";
import type { ReactNode } from "react";

export const GIFT_BUTTON_SIZE = {
  XS: "xs",
  SM: "sm",
} as const;

export type GiftButtonSize =
  (typeof GIFT_BUTTON_SIZE)[keyof typeof GIFT_BUTTON_SIZE];

export const SIZE_CONFIG: Record<
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

export interface DialogHandle {
  open: () => void;
  close: () => void;
}

export interface SizeConfig {
  btn: string;
  icon: string;
  gap: string;
}
export interface BaseDialogProps {
  post: PostType;
  size: GiftButtonSize;
  gift?: GiftType | null;

  /** Called when user wants to go back to previous step */
  onGoBack?: () => void;
  /** Called when dialog flow is complete */
  onComplete?: () => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Custom trigger button (if not provided, uses default) */
  trigger?: ReactNode;
  /** Hide the trigger button entirely (for programmatic opening only) */
  hideTrigger?: boolean;
}
