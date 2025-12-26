import { useAuth } from "@/hooks/use-auth";
import { useExistingGift } from "@/hooks/use-existing-gift";
import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconTruck } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import {
  SIZE_CONFIG,
  type DialogHandle,
  type GiftButtonSize,
} from "../dialogs-utils";
import CancelReservationBanner from "../cancel-reservation-banner";
export interface SendEGiftDialogDialogProps {
  post: PostType;
  size: GiftButtonSize;

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
  /** Navigation callback to in-person dialog */
  onNavigateToCancelReservation?: () => void;
  /** Navigation callback to open cancel reservation dialog */
  onOpenCancelDialog: () => void;
}
export const SendEGiftDialog = forwardRef<
  DialogHandle,
  SendEGiftDialogDialogProps
>(
  (
    {
      post,
      size = "sm",
      onGoBack,
      onCancel,
      trigger,
      onOpenCancelDialog,
      hideTrigger = false,
    },
    ref,
  ) => {
    const user = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const sizeConfig = SIZE_CONFIG[size];

    // Determine if resuming an existing reservation
    const isGifter = user?.uid === post?.gift?.gifter?.uid;
    const isReserved = post?.gift?.giftStatus === "reserved";
    const isResuming = isGifter && isReserved;

    // Fetch existing gift if resuming
    const {
      data: existingGift,
      isLoading: isLoadingGift,
      refetch: refetchGift,
    } = useExistingGift(post.id, isResuming);

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        dialogRef.current?.showModal();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    const handleOpen = () => {
      dialogRef.current?.showModal();
    };

    const handleClose = () => {
      dialogRef.current?.close();
    };

    const handleGoBack = () => {
      handleClose();
      onGoBack?.();
    };

    const handleCancel = () => {
      handleClose();
      onCancel?.();
    };

    // Default trigger button
    const defaultTrigger = (
      <button
        onClick={handleOpen}
        className={cn("btn btn-primary", sizeConfig?.btn)}
      >
        <IconTruck className={sizeConfig?.icon} />
        <span>Send E-gift</span>
      </button>
    );

    return (
      <>
        {/* Trigger Button */}
        {!hideTrigger && (trigger || defaultTrigger)}

        {/* Dialog */}
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-w-lg">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center gap-3">
              {onGoBack && (
                <button
                  onClick={handleGoBack}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Go back"
                >
                  <IconArrowLeft className="size-4" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 flex size-10 items-center justify-center rounded-2xl">
                  <IconTruck className="text-primary size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">E fucking gift dialog</h3>
                  <p className="text-base-content/60 text-xs">
                    Step 1 of 3: Package details
                  </p>
                </div>
              </div>
            </div>

            {isResuming && existingGift && (
              <CancelReservationBanner
                gift={existingGift}
                onOpenCancelDialog={onOpenCancelDialog}
                handleClose={handleClose}
              />
            )}

            {/* Content */}
            <div className="py-4">
              <p className="text-base-content/70 text-sm">
                Configure your shipping label for "{post.title}"
              </p>

              {/* Your form fields would go here */}
              <div className="bg-base-200 mt-4 rounded-xl p-4">
                <p className="text-sm">Package details form...</p>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-action flex-col gap-2">
              <button className="btn btn-primary w-full">
                Continue to Payment
              </button>

              <div className="flex w-full gap-2">
                {onGoBack && (
                  <button
                    onClick={handleGoBack}
                    className="btn btn-ghost flex-1"
                  >
                    Change Delivery Method
                  </button>
                )}
                <button onClick={handleCancel} className="btn btn-ghost flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

SendEGiftDialog.displayName = "SendEGiftDialog";
export default SendEGiftDialog;
