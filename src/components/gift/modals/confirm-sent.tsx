import { cn } from "@/lib/utils";
import { IconArrowLeft, IconCheck, IconTruck } from "@tabler/icons-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  SIZE_CONFIG,
  type BaseDialogProps,
  type DialogHandle,
} from "../dialog-types";

export const ConfirmSentDialog = forwardRef<DialogHandle, BaseDialogProps>(
  (
    {
      post,
      gift,
      size = "sm",
      onGoBack,
      onCancel,
      trigger,
      hideTrigger = false,
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const sizeConfig = SIZE_CONFIG[size];
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
        <IconCheck className={sizeConfig?.icon} />
        <span>Confirm Sent</span>
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
                  <h3 className="text-lg font-bold">Create Shipping Label</h3>
                  <p className="text-base-content/60 text-xs">
                    Step 1 of 3: Package details
                  </p>
                </div>
              </div>
            </div>

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

ConfirmSentDialog.displayName = "ConfirmSentDialog";
export default ConfirmSentDialog;
