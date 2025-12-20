import type { GiftType, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconTruck } from "@tabler/icons-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
export interface DialogHandle {
  open: () => void;
  close: () => void;
}

export interface SizeConfig {
  btn: string;
  icon: string;
  gap: string;
}
interface BaseDialogProps {
  post: PostType;
  gift?: GiftType | null;
  sizeConfig: SizeConfig;
  /** If true, dialog opens immediately on mount */
  defaultOpen?: boolean;
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

// =============================================================================
// Ship Label Dialog (Self-contained)
// =============================================================================

export const ShipLabelDialog = forwardRef<DialogHandle, BaseDialogProps>(
  (
    {
      post,
      gift,
      sizeConfig,
      defaultOpen = false,
      onGoBack,
      onComplete,
      onCancel,
      trigger,
      hideTrigger = false,
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        dialogRef.current?.showModal();
        setIsOpen(true);
      },
      close: () => {
        dialogRef.current?.close();
        setIsOpen(false);
      },
    }));

    // Open on mount if defaultOpen
    useEffect(() => {
      if (defaultOpen) {
        dialogRef.current?.showModal();
      }
    }, [defaultOpen]);

    const handleOpen = () => {
      dialogRef.current?.showModal();
      setIsOpen(true);
    };

    const handleClose = () => {
      dialogRef.current?.close();
      setIsOpen(false);
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
        <span>Create Shipping Label</span>
      </button>
    );

    return (
      <>
        {/* Trigger Button */}
        {!hideTrigger && (trigger || defaultTrigger)}

        {/* Dialog */}
        <dialog
          ref={dialogRef}
          className="modal"
          onClose={() => setIsOpen(false)}
        >
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
                    Step 2 of 3: Package details
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

ShipLabelDialog.displayName = "ShipLabelDialog";
export default ShipLabelDialog;
