import { useWishGiftActions } from "@/hooks/use-wish-gift-actions";
import {
  DELIVERY_METHODS,
  markAsReservedSchema,
  type DeliveryMethod,
  type PostType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import {
  IconCheck,
  IconClock,
  IconGift,
  IconHandStop,
  IconLoader,
  IconMail,
  IconTruck,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  SIZE_CONFIG,
  type DialogHandle,
  type GiftButtonSize,
} from "../dialog-types";
import CancelReservationBanner from "./cancel-reservation-banner";

// =============================================================================
// Types
// =============================================================================

interface ReserveDialogProps {
  post: PostType;
  size?: GiftButtonSize;
  /** Hide the trigger button (for programmatic opening) */
  hideTrigger?: boolean;
  /** Navigation callback to ship label dialog */
  onNavigateToShipLabel?: () => void;
  /** Navigation callback to e-gift dialog */
  onNavigateToEGift?: () => void;
  /** Navigation callback to open cancel reservation dialog */
  onOpenCancelDialog: () => void;
}

// =============================================================================
// Delivery Method Options
// =============================================================================

const DELIVERY_METHOD_OPTIONS = [
  {
    value: DELIVERY_METHODS.SHIP_LABEL,
    title: "Ship with Label",
    description:
      "We'll provide a prepaid shipping label for you to send the item.",
    icon: IconTruck,
    bestFor: ["Physical items", "Handmade gifts", "Large packages"],
  },
  {
    value: DELIVERY_METHODS.E_GIFT,
    title: "Send as E-Gift",
    description: "Purchase online and send directly to recipient's email.",
    icon: IconMail,
    bestFor: ["Gift cards", "Subscriptions", "Digital content"],
  },
  {
    value: DELIVERY_METHODS.IN_PERSON,
    title: "Deliver in Person",
    description: "Handle the delivery yourself for a personal touch.",
    icon: IconHandStop,
    bestFor: ["Local gifts", "Experiences", "Perishables"],
  },
];

// =============================================================================
// Component
// =============================================================================

const ReserveDialog = forwardRef<DialogHandle, ReserveDialogProps>(
  (
    {
      post,
      size = "sm",
      hideTrigger = false,
      onNavigateToShipLabel,
      onNavigateToEGift,
      onOpenCancelDialog,
    },
    ref,
  ) => {
    const user = useAuth();
    const { reserveGiftAsync, updateDeliveryMethod, isLoading } =
      useWishGiftActions();

    const dialogRef = useRef<HTMLDialogElement>(null);
    const sizeConfig = SIZE_CONFIG[size];

    // const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Determine if resuming an existing reservation
    const isGifter = user?.uid === post?.gift?.gifter?.uid;
    const isReserved = post?.gift?.giftStatus === "reserved";
    const existingGift = post.gift;
    const isResuming = isGifter && isReserved && existingGift;

    // Form setup
    const reserveWishForm = useForm({
      defaultValues: {
        deliveryMethod: (post.gift.deliveryMethod ||
          DELIVERY_METHODS.SHIP_LABEL) as DeliveryMethod,
      },
      validators: {
        onChange: markAsReservedSchema,
      },
      onSubmit: async ({ value }) => {
        if (!post.id) return;

        // If there is a gift delivery method unchanged, just continue to next step
        if (
          isResuming &&
          value.deliveryMethod === existingGift.deliveryMethod
        ) {
          handleClose();
          navigateToDeliveryDialog(value.deliveryMethod);
          return;
        }

        // If resuming but changing delivery method, update the gift
        if (
          isResuming &&
          existingGift.giftId &&
          value.deliveryMethod !== existingGift.deliveryMethod
        ) {
          updateDeliveryMethod({
            giftId: existingGift.giftId,
            deliveryMethod: value.deliveryMethod,
            postId: post.id,
            postAuthorId: post.author.uid,
          });
          handleClose();
          navigateToDeliveryDialog(value.deliveryMethod);
          return;
        }

        // New reservation
        await reserveGiftAsync({
          postId: post.id,
          post: post,
          deliveryMethod: value.deliveryMethod,
        });

        handleClose();
        navigateToDeliveryDialog(value.deliveryMethod);
      },
    });

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

    // Navigate to the appropriate delivery dialog with a delay
    // This ensures:
    // 1. The current dialog is fully closed
    // 2. React has time to re-render (user becomes gifter)
    // 3. New refs are set up in GifterDialogs
    const navigateToDeliveryDialog = (method: DeliveryMethod) => {
      console.log("navigateToDeliveryDialog called with:", method);
      console.log("Callbacks available:", {
        onNavigateToShipLabel: !!onNavigateToShipLabel,
        onNavigateToEGift: !!onNavigateToEGift,
      });

      // Longer delay to allow:
      // - Dialog close animation (100ms)
      // - React re-render after mutation (query invalidation)
      // - New component mount and ref setup
      setTimeout(() => {
        console.log("Executing navigation to:", method);
        switch (method) {
          case DELIVERY_METHODS.SHIP_LABEL:
            console.log("Calling onNavigateToShipLabel");
            onNavigateToShipLabel?.();
            break;
          case DELIVERY_METHODS.E_GIFT:
            console.log("Calling onNavigateToEGift");
            onNavigateToEGift?.();
            break;
        }
      }, 400); // 400ms delay to allow full re-render cycle
    };

    const getMethodTitle = (value: string) => {
      return (
        DELIVERY_METHOD_OPTIONS.find((m) => m.value === value)?.title || value
      );
    };

    // Default trigger button
    const defaultTrigger = (
      <button
        onClick={handleOpen}
        className={cn("btn", "btn-primary", sizeConfig.btn)}
      >
        {isResuming ? (
          <IconClock className={sizeConfig.icon} />
        ) : (
          <IconGift className={sizeConfig.icon} />
        )}
        <span>{isResuming ? "Continue With This Gift" : "Gift This"}</span>
      </button>
    );

    return (
      <>
        {/* Trigger Button */}
        {!hideTrigger && defaultTrigger}

        {/* Dialog */}
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-w-lg">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl",
                  isResuming ? "bg-warning/20" : "bg-primary/20",
                )}
              >
                {isResuming ? (
                  <IconClock className="text-warning size-5" />
                ) : (
                  <IconGift className="text-primary size-5" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isResuming ? "Continue With This Gift" : "Reserve This Gift"}
                </h3>
                {isResuming && (
                  <p className="text-base-content/60 text-xs">
                    Pick up where you left off
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}

            <div className="py-4">
              {/* Resuming Header with Cancel Option */}
              {isResuming && existingGift && (
                <CancelReservationBanner
                  giftExpiresAt={existingGift.expiresAt}
                  onOpenCancelDialog={onOpenCancelDialog}
                  handleClose={handleClose}
                />
              )}

              {/* Delivery Method Selection */}
              <reserveWishForm.Field name="deliveryMethod">
                {(field) => (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="label">
                        <span className="label-text font-semibold">
                          {isResuming
                            ? "Delivery Method"
                            : "Choose Delivery Method"}
                        </span>
                      </label>
                      {!isResuming && (
                        <span className="text-base-content/50 text-xs">
                          You can change this later
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {DELIVERY_METHOD_OPTIONS.map((method) => {
                        const isSelected = field.state.value === method.value;
                        const Icon = method.icon;
                        const wasOriginalChoice =
                          isResuming &&
                          existingGift?.deliveryMethod === method.value;

                        return (
                          <label
                            key={method.value}
                            className={cn(
                              "relative flex cursor-pointer rounded-3xl border-2 p-2 transition-all md:p-3 lg:p-4",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-base-300 bg-base-100 hover:border-base-content/20 hover:bg-base-200/50",
                            )}
                          >
                            <input
                              type="radio"
                              name="delivery-method"
                              value={method.value}
                              checked={isSelected}
                              onChange={() => field.handleChange(method.value)}
                              className="sr-only"
                            />

                            {/* Icon */}
                            <div
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-xl",
                                isSelected
                                  ? "bg-primary text-primary-content"
                                  : "bg-base-200 text-base-content/70",
                              )}
                            >
                              <Icon className="size-4" />
                            </div>

                            {/* Content */}
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "text-sm font-semibold",
                                      isSelected && "text-primary",
                                    )}
                                  >
                                    {method.title}
                                  </span>
                                  {wasOriginalChoice && (
                                    <span className="badge badge-warning badge-xs">
                                      Your choice
                                    </span>
                                  )}
                                </div>

                                {/* Selection indicator */}
                                <div
                                  className={cn(
                                    "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                                    isSelected
                                      ? "border-primary bg-primary text-primary-content"
                                      : "border-base-300 bg-base-100",
                                  )}
                                >
                                  {isSelected && (
                                    <IconCheck className="size-3" />
                                  )}
                                </div>
                              </div>
                              <p className="text-base-content/70 mt-1 text-xs">
                                {method.description}
                              </p>

                              {/* Best for badges */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {method.bestFor.map((item) => (
                                  <span
                                    key={item}
                                    className={cn(
                                      "badge badge-xs border",
                                      isSelected
                                        ? "badge-primary badge-outline"
                                        : "badge-ghost",
                                    )}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </reserveWishForm.Field>

              {/* Info Box - Only for new reservations */}
              {!isResuming && (
                <div className="bg-primary/10 rounded-3xl p-4">
                  <p className="mb-2 text-sm font-semibold">
                    Before you reserve:
                  </p>
                  <ul className="text-base-content/80 space-y-1.5 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>30-day window</strong> before reservation
                        expires
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>You stay anonymous</strong> until the recipient
                        confirms delivery
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Free cancellation</strong> anytime before you
                        send
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Recipient address</strong> will not be shared
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Actions */}
              <reserveWishForm.Subscribe
                selector={(state) => state.values.deliveryMethod}
              >
                {(deliveryMethod) => (
                  <div className="mt-6 flex w-full flex-col gap-2">
                    <button
                      type="button"
                      className={cn("btn btn-sm", "btn-primary")}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        reserveWishForm.handleSubmit();
                      }}
                    >
                      {isLoading ? (
                        <>
                          <IconLoader className="size-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Continue with {getMethodTitle(deliveryMethod)}</>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm w-full"
                      disabled={isLoading}
                      onClick={handleClose}
                    >
                      {isResuming ? "Close" : "Cancel"}
                    </button>
                  </div>
                )}
              </reserveWishForm.Subscribe>
            </div>
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

ReserveDialog.displayName = "ReserveDialog";
export default ReserveDialog;
