import { useWishGiftActions } from "@/hooks/use-wish-gift-actions";
import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconLoader,
  IconX,
} from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  SIZE_CONFIG,
  type DialogHandle,
  type GiftButtonSize,
} from "../dialogs-utils";

interface CancelReservationDialogProps {
  post: PostType;
  size?: GiftButtonSize;
  /** Hide the trigger button (for programmatic opening) */
  hideTrigger?: boolean;
  /** Called when user wants to go back to the previous dialog */
  onGoBack?: () => void;
  /** Called after successful cancellation */
  onCancelSuccess?: () => void;
}

export const CancelReservationDialog = forwardRef<
  DialogHandle,
  CancelReservationDialogProps
>(
  (
    { post, size = "sm", hideTrigger = false, onGoBack, onCancelSuccess },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const sizeConfig = SIZE_CONFIG[size];

    const { cancelReservationAsync, isCancellingReservation } =
      useWishGiftActions();

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

    const handleConfirmCancel = async () => {
      if (!post.gift?.giftId || !post.id) return;

      try {
        await cancelReservationAsync({
          giftId: post.gift?.giftId,
          postId: post.id,
          postAuthorId: post.author.uid,
        });

        handleClose();
        onCancelSuccess?.();
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error("Failed to cancel reservation:", error);
      }
    };

    // Default trigger button
    const defaultTrigger = (
      <button
        onClick={handleOpen}
        className={cn("btn btn-error btn-soft", sizeConfig?.btn)}
      >
        <IconX className={sizeConfig?.icon} />
        <span>Cancel Reservation</span>
      </button>
    );

    return (
      <>
        {/* Trigger Button */}
        {!hideTrigger && defaultTrigger}

        {/* Dialog */}
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-w-md bg-rose-50">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              {onGoBack && (
                <button
                  onClick={handleGoBack}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Go back"
                  disabled={isCancellingReservation}
                >
                  <IconArrowLeft className="size-4" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-error/20 flex size-10 items-center justify-center rounded-2xl">
                  <IconAlertTriangle className="text-error size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Cancel Reservation?</h3>
                  <p className="text-base-content/60 text-xs">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="py-4">
              <p className="text-sm">
                Are you sure you want to cancel your reservation for{" "}
                <strong>"{post.title}"</strong>?
              </p>
              <ul className="text-base-content/70 mt-3 space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-error">•</span>
                  <span>
                    The gift will become available for others to reserve
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error">•</span>
                  <span>Any messages or notes you added will be lost</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error">•</span>
                  <span>You can reserve it again if it's still available</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="modal-action flex-col gap-2">
              <button
                onClick={handleConfirmCancel}
                className="btn btn-sm btn-error w-full"
                disabled={isCancellingReservation}
              >
                {isCancellingReservation ? (
                  <>
                    <IconLoader className="size-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <IconX className="size-4" />
                    Yes, Cancel Reservation
                  </>
                )}
              </button>

              <button
                onClick={handleGoBack}
                className="btn btn-sm btn-ghost w-full"
                disabled={isCancellingReservation}
              >
                Keep Reservation
              </button>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button disabled={isCancellingReservation}>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

CancelReservationDialog.displayName = "CancelReservationDialog";
export default CancelReservationDialog;
