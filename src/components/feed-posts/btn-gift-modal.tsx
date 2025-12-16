// components/gift-action-modal.tsx
import { useWishGiftActions } from "@/hooks/use-wish-gift-actions";
import {
  confirmReceiptSchema,
  deliveryMethods,
  markAsSentSchema,
  type DeliveryMethod,
  type GiftActionModalProps,
} from "@/lib/types";
import { IconCheck, IconGift, IconPackage, IconX } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

export function GiftActionModal({
  isOpen,
  onClose,
  modalType,
  post,
}: GiftActionModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [trackingInfo, setTrackingInfo] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("shipped");

  const {
    revertToReserved,
    revertToSent,
    reserveGift,
    markAsSent,
    confirmReceipt,
    cancelReservation,
    isLoading,
  } = useWishGiftActions();

  // Forms
  const markAsSentForm = useForm({
    defaultValues: {
      deliveryMethod: "shipped" as DeliveryMethod,
      trackingInfo: "",
      message: "",
    },

    validators: {
      onChange: markAsSentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!post.id) return;

      markAsSent(
        {
          giftId: `${post.id}_${post.gifter?.uid}`,
          postId: post.id,
          postAuthorId: post.author.uid,
          options: {
            trackingInfo: value.trackingInfo || undefined,
            messageToRecipient: value.message || undefined,
            deliveryMethod: value.deliveryMethod,
          },
        },
        {
          onSuccess: () => {
            markAsSentForm.reset();
            onClose();
          },
        },
      );
    },
  });

  const confirmReceiptForm = useForm({
    defaultValues: {
      message: "",
    },

    validators: {
      onChange: confirmReceiptSchema,
    },
    onSubmit: async ({ value }) => {
      if (!post.id || !post.gifter?.uid) return;

      confirmReceipt(
        {
          giftId: `${post.id}_${post.gifter.uid}`,
          postId: post.id,
          postAuthorId: post.author.uid,
          recipientNotes: value.message || undefined,
        },
        {
          onSuccess: () => {
            confirmReceiptForm.reset();
            onClose();
          },
        },
      );
    },
  });

  // Handle modal open/close
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (!isOpen && modalRef.current) {
      modalRef.current.close();
      // Reset form
      // setTrackingInfo("");
      setMessage("");
      setDeliveryMethod("shipped");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!post.id) return;

    switch (modalType) {
      case "reserve":
        reserveGift(
          { postId: post.id, post },
          { onSuccess: () => handleClose() },
        );
        break;

      case "markAsSent":
        markAsSentForm.handleSubmit();
        break;

      case "confirmReceipt":
        confirmReceiptForm.handleSubmit();
        break;

      case "cancel":
        cancelReservation(
          {
            giftId: `${post.id}_${post.gifter?.uid}`,
            postId: post.id,
            postAuthorId: post.author.uid,
          },
          { onSuccess: () => handleClose() },
        );
        break;

      case "revertToReserved":
        revertToReserved(
          {
            giftId: `${post.id}_${post.gifter?.uid}`,
            postId: post.id,
            postAuthorId: post.author.uid,
          },
          { onSuccess: () => handleClose() },
        );
        break;
      case "revertToSent":
        revertToSent(
          {
            giftId: `${post.id}_${post.gifter?.uid}`,
            postId: post.id,
            postAuthorId: post.author.uid,
          },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const getModalContent = () => {
    switch (modalType) {
      case "reserve":
        return {
          icon: <IconGift className="text-primary size-8" />,
          title: "Reserve This Gift?",
          description: (
            <>
              <p className="mb-4">
                You're about to reserve <strong>{post.title}</strong> for{" "}
                <strong>@{post.author.handle}</strong>.
              </p>
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div className="text-sm">
                  <p className="font-semibold">Important:</p>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>You have 30 days to send this gift.</li>
                    <li>
                      The recipient won't know it's you until they get the gift
                      and confirm they recieved it.
                    </li>
                    <li>You can cancel anytime before sending.</li>
                  </ul>
                </div>
              </div>
            </>
          ),
          confirmText: "Reserve Gift",
          confirmClass: "btn-primary",
        };

      case "markAsSent":
        return {
          icon: <IconPackage className="text-success size-8" />,
          title: "Mark Gift as Sent",
          description: (
            <>
              <p className="mb-4">
                Let <strong>@{post.author.handle}</strong> know you've sent
                their gift!
              </p>
              <div>
                <markAsSentForm.Field
                  name="deliveryMethod"
                  children={(field) => {
                    const { isTouched, errors } = field.state.meta;
                    const hasError = isTouched && errors.length > 0;
                    const message = isTouched ? errors[0]?.message : null;

                    return (
                      <div className="flex flex-col gap-1">
                        <label className="label">
                          <span className="label-text">Delivery Method</span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value as DeliveryMethod)
                          }
                          onBlur={field.handleBlur}
                        >
                          <option value="shipped">📦 Shipped</option>
                          <option value="digital">💻 Digital</option>
                          <option value="in-person">🤝 In Person</option>
                          <option value="other">📋 Other</option>
                        </select>
                        {message && (
                          <div className="text-error mt-1.5 ml-1.5 text-xs">
                            {message}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              {deliveryMethod === deliveryMethods[0] && (
                <div className="form-control mt-4 w-full">
                  <label className="label">
                    <span className="label-text">
                      Tracking Number (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="1Z999AA10123456784"
                    className="input input-bordered"
                    value={trackingInfo}
                    onChange={(e) => setTrackingInfo(e.target.value)}
                  />
                </div>
              )}

              <div className="form-control mt-4 w-full">
                <label className="label">
                  <span className="label-text">
                    Message to Recipient (Optional)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Hope you enjoy this! 🎁"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <label className="label">
                  <span className="label-text-alt"></span>
                  <span className="label-text-alt">{message.length}/500</span>
                </label>
              </div>
            </>
          ),
          confirmText: "Mark as Sent",
          confirmClass: "btn-success",
        };

      case "confirmReceipt":
        return {
          icon: <IconCheck className="text-success size-8" />,
          title: "Confirm Gift Receipt",
          description: (
            <>
              <p className="mb-4">
                Confirm you received this gift. The gifter's identity will be
                revealed!
              </p>

              <div className="alert alert-success mb-4">
                <IconGift className="size-6" />
                <div>
                  <p className="font-semibold">Gift Details:</p>
                  <p className="text-sm">{post.title}</p>
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Thank You Message (Optional)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Thank you so much! I love it! 💝"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <label className="label">
                  <span className="label-text-alt"></span>
                  <span className="label-text-alt">{message.length}/500</span>
                </label>
              </div>
            </>
          ),
          confirmText: "Confirm Receipt",
          confirmClass: "btn-success",
        };

      case "cancel":
        return {
          icon: <IconX className="text-error size-8" />,
          title: "Cancel Reservation?",
          description: (
            <>
              <p className="mb-4">
                Are you sure you want to cancel your reservation for{" "}
                <strong>{post.title}</strong>?
              </p>
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  The gift will become available for others to reserve.
                </span>
              </div>
            </>
          ),
          confirmText: "Yes, Cancel Reservation",
          confirmClass: "btn-error",
        };
      case "revertToReserved":
        return {
          icon: <IconX className="text-error size-8" />,
          title: "Gift wasn't sent yet?",
          description: (
            <>
              <p className="mb-4">
                Are you sure you want to cancel sent status for your gift{" "}
                <strong>{post.title}</strong>?
              </p>
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>The gift status will be reverted to rserved.</span>
              </div>
            </>
          ),
          confirmText: "Yes, Cancel Reservation",
          confirmClass: "btn-error",
        };
      case "revertToSent":
        return {
          icon: <IconX className="text-error size-8" />,
          title: "Didn't get your this gift yet?",
          description: (
            <>
              <p className="mb-4">
                Are you sure you want to cancel recieved status for the gift{" "}
                <strong>{post.title}</strong>?
              </p>
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  The gift status will be reverted to awaiting to be received.
                </span>
              </div>
            </>
          ),
          confirmText: "Yes, Mark as Not Sent",
          confirmClass: "btn-error",
        };
    }
  };

  const content = getModalContent();

  return (
    <dialog ref={modalRef} className="modal" onClose={handleClose}>
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          {content.icon}
          <h3 className="text-lg font-bold">{content.title}</h3>
        </div>

        {/* Content */}
        <div className="py-4">{content.description}</div>

        {/* Actions */}
        <div className="mt-6 flex w-full flex-col gap-2">
          <button
            className={`btn btn-sm ${content.confirmClass}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Processing...
              </>
            ) : (
              content.confirmText
            )}
          </button>

          <form method="dialog" className="w-full">
            <button
              className="btn btn-sm btn-ghost w-full"
              disabled={isLoading}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
