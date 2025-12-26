import { useAuth } from "@/hooks/use-auth";
import { useExistingGift } from "@/hooks/use-existing-gift";
import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconTruck } from "@tabler/icons-react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import CancelReservationBanner from "../../cancel-reservation-banner";
import {
  SIZE_CONFIG,
  type DialogHandle,
  type GiftButtonSize,
} from "../../dialogs-utils";
import PackageDetailsStep from "./package-details/package-details";
import Payment from "./payment";
import Review from "./review";

export interface ShipLabelDialogProps {
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

export type ShipLabelStep = "package_info" | "payment" | "review";

export const CreateShipLabelDialog = forwardRef<
  DialogHandle,
  ShipLabelDialogProps
>(
  (
    {
      post,
      size = "sm",
      onGoBack,
      onCancel,
      trigger,
      hideTrigger = false,
      onOpenCancelDialog,
    },
    ref,
  ) => {
    const user = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const sizeConfig = SIZE_CONFIG[size];

    const [currentStep, setCurrentStep] =
      useState<ShipLabelStep>("package_info");
    const [completedSteps, setCompletedSteps] = useState<ShipLabelStep[]>([]);

    // Determine if resuming an existing reservation
    const isGifter = user?.uid === post?.gift?.gifter?.uid;

    // Fetch existing gift if resuming
    const {
      data: existingGift,
      isLoading: isLoadingGift,
      refetch: refetchGift,
    } = useExistingGift(post.id, isGifter);

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

    // Handlers
    const handleStepNext = useCallback(async () => {
      if (currentStep === "package_info") {
        // Save package info and move to payment

        setCompletedSteps((prev) => [...prev, "package_info"]);

        // Fetch rates for the package
        // const values = packageInfoForm.getFieldValue("weight")
        //   ? packageInfoForm.state.values
        //   : DEFAULT_PACKAGE_INFO;
        // fetchRatesMutation.mutate(values);

        // Create payment intent
        // if (selectedRate) {
        //   createPaymentIntentMutation.mutate(selectedRate.rate);
        // }

        setCurrentStep("payment");
      } else if (currentStep === "payment") {
        setCompletedSteps((prev) => [...prev, "payment"]);
        setCurrentStep("review");
      }
    }, [currentStep]);

    const handleStepBack = useCallback(() => {
      if (currentStep === "payment") {
        setCurrentStep("package_info");
      } else if (currentStep === "review") {
        setCurrentStep("payment");
      }
    }, [currentStep]);

    if (isLoadingGift) return <>Loading...</>;
    if (!existingGift) return <>Cannot get gift</>;

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
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-w-lg">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 flex size-10 items-center justify-center rounded-2xl">
                  <IconTruck className="text-primary size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Create Shipping Label</h3>
                  <p className="text-base-content/60 text-xs">
                    {currentStep === "package_info" &&
                      "Step 1 of 3: Package details"}
                    {currentStep === "payment" && "Step 2 of 3: Make a payment"}
                    {currentStep === "review" && "Step 3 of 3: Save your label"}
                  </p>
                </div>
              </div>
            </div>
            {/* Resuming Header with Cancel Option */}
            <CancelReservationBanner
              giftExpiresAt={existingGift?.expiresAt || post.gift.expiresAt}
              onOpenCancelDialog={onOpenCancelDialog}
              handleClose={handleClose}
            />

            {/* Content */}
            {currentStep === "package_info" && (
              <PackageDetailsStep
                onNext={handleStepNext}
                onGoBack={handleGoBack}
                onCancel={handleCancel}
                gift={existingGift}
              />
            )}
            {currentStep === "payment" && (
              <Payment
                onNext={handleStepNext}
                onGoBack={handleStepBack}
                onCancel={handleCancel}
                gift={existingGift}
              />
            )}
            {currentStep === "review" && (
              <Review
                onGoBack={handleStepBack}
                onCancel={handleCancel}
                gift={existingGift}
              />
            )}
          </div>

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

CreateShipLabelDialog.displayName = "CreateShipLabelDialog";
export default CreateShipLabelDialog;
