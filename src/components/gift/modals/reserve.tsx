import { useWishGiftActions } from "@/hooks/use-wish-gift-actions";
import {
  DELIVERY_METHODS,
  markAsReservedSchema,
  type DeliveryMethod,
  type PostType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import { useExistingGift } from "@/hooks/use-existing-gift";
import {
  IconCheck,
  IconGift,
  IconHandStop,
  IconLoader,
  IconMail,
  IconTruck,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import EGiftDialog from "./e-gift";
import { type DialogHandle, ShipLabelDialog } from "./ship-label";

export default function ReserveDialog({
  post,
  sizeConfig,
}: {
  post: PostType;
  sizeConfig: {
    btn: string;
    icon: string;
    gap: string;
  };
}) {
  const user = useAuth();
  const { reserveGift, reserveGiftAsync, isLoading } = useWishGiftActions();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const shipLabelDialogRef = useRef<DialogHandle>(null);
  const eGiftDialogRef = useRef<DialogHandle>(null);

  const isGifter = user?.uid === post.gift?.gifter?.uid;
  const isReserved = post?.gift?.giftStatus === "reserved";
  const isResuming = isGifter && isReserved;

  const {
    data: existingGift,
    isLoading: isLoadingGift,
    refetch: refetchGift,
  } = useExistingGift(post.id, isResuming);

  const reserveWishForm = useForm({
    defaultValues: {
      deliveryMethod: (existingGift?.deliveryMethod ||
        DELIVERY_METHODS.SHIP_LABEL) as DeliveryMethod,
    },

    validators: {
      onChange: markAsReservedSchema,
    },

    onSubmit: async ({ value }) => {
      if (!post.id) return;

      // If resuming and delivery method unchanged, just continue to next step
      if (isResuming && existingGift?.deliveryMethod === value.deliveryMethod) {
        dialogRef.current?.close();
        openNextDialog(value.deliveryMethod);
        return;
      }

      // If resuming but changing delivery method, update the gift
      if (isResuming && existingGift) {
        // TODO: Add updateGiftDeliveryMethod mutation if you want to allow changing
        // For now, just continue with the existing method
        dialogRef.current?.close();
        openNextDialog(existingGift.deliveryMethod || value.deliveryMethod);
        return;
      }
      // New reservation
      // await reserveGiftAsync({
      //   postId: post.id,
      //   post: post,
      //   deliveryMethod: value.deliveryMethod,
      // });
      dialogRef.current?.close();
      if (value.deliveryMethod === DELIVERY_METHODS.SHIP_LABEL) {
        shipLabelDialogRef.current?.open();
      } else if (value.deliveryMethod === DELIVERY_METHODS.E_GIFT) {
        eGiftDialogRef.current?.open();
      }
    },
  });

  const openNextDialog = (method: DeliveryMethod) => {
    switch (method) {
      case DELIVERY_METHODS.SHIP_LABEL:
        shipLabelDialogRef.current?.open();
        break;
      case DELIVERY_METHODS.E_GIFT:
        eGiftDialogRef.current?.open();
        break;
    }
  };

  const handleOpen = () => {
    dialogRef.current?.showModal();
  };

  const handleGoBackToReserve = () => {
    dialogRef.current?.showModal(); // Re-open this dialog
  };

  const deliveryMethods = [
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

  const getMethodTitle = (value: string) => {
    return deliveryMethods.find((m) => m.value === value)?.title || value;
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={cn("btn btn-primary", sizeConfig?.btn)}
      >
        <IconGift className={sizeConfig?.icon} />
        <span>Gift This</span>
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <IconGift className="text-primary size-8" />
            <h3 className="text-lg font-bold">Reserve This Gift</h3>
          </div>

          {/* Content */}
          <div className="py-4">
            {/* Delivery Method Selection */}
            <reserveWishForm.Field name="deliveryMethod">
              {(field) => (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Choose Delivery Method
                      </span>
                    </label>
                    <span className="text-base-content/50 text-xs">
                      You can change this later
                    </span>
                  </div>

                  <div className="space-y-3">
                    {deliveryMethods.map((method) => {
                      const isSelected = field.state.value === method.value;
                      const Icon = method.icon;

                      return (
                        <label
                          key={method.value}
                          className={`relative flex cursor-pointer rounded-3xl border-2 p-2 transition-all md:p-3 lg:p-4 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-base-300 bg-base-100 hover:border-base-content/20 hover:bg-base-200/50"
                          } `}
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
                            className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/70"} `}
                          >
                            <Icon className="size-4" />
                          </div>

                          {/* Content */}
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold ${isSelected ? "text-primary" : ""}`}
                              >
                                {method.title}
                              </span>

                              {/* Selection indicator */}
                              <div
                                className={`flex size-5 items-center justify-center rounded-full border-2 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-content"
                                    : "border-base-300 bg-base-100"
                                } `}
                              >
                                {isSelected && <IconCheck className="size-3" />}
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
                                  className={`badge badge-xs border ${isSelected ? "badge-primary badge-outline" : "badge-ghost"}`}
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

            {/* Info */}
            <div className="bg-primary/10 rounded-3xl p-4">
              <div className="flex gap-3">
                <div>
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
                        create the label
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Recipient address (physical and e-mail)</strong>{" "}
                        will not be shared
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <reserveWishForm.Subscribe
              selector={(state) => state.values.deliveryMethod}
            >
              {(deliveryMethod) => (
                <div className="mt-6 flex w-full flex-col gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
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
                    className="btn btn-sm btn-ghost w-full"
                    disabled={isLoading}
                    onClick={() => dialogRef.current?.close()}
                  >
                    Cancel
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

      {/* <ShipLabelDialog ref={shipLabelDialogRef} /> */}

      <ShipLabelDialog
        ref={shipLabelDialogRef}
        sizeConfig={sizeConfig}
        post={post}
        hideTrigger // No visible button
        onGoBack={handleGoBackToReserve} // Opens reserve dialog again
      />
      <EGiftDialog ref={eGiftDialogRef} />
    </>
  );
}
