import {
  eGiftFormSchema,
  type DeliveryType,
  type GiftKindType,
  type PostType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconGiftCard,
  IconTruck,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import CancelReservationBanner from "../cancel-reservation-banner";
import {
  SIZE_CONFIG,
  type DialogHandle,
  type GiftButtonSize,
} from "../dialogs-utils";

const GIFT_TYPE_OPTIONS = [
  { value: "gift_card", label: "Gift Card" },
  { value: "experience_booking", label: "Experience/Booking" },
  { value: "digital_subscription", label: "Digital Subscription" },
  { value: "travel_tickets", label: "Travel Tickets" },
  { value: "voucher_coupon", label: "Voucher/Coupon" },
  { value: "monetary_contribution", label: "Monetary Contribution" },
  { value: "other", label: "Other" },
] as const;

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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [showCode, setShowCode] = useState(false);

    const sizeConfig = SIZE_CONFIG[size];

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const form = useForm({
      defaultValues: {
        giftType: "gift_card" as GiftKindType,
        provider: "",
        giftDetails: {
          code: "",
          amount: "",
          expiryDate: "",
        },
        redemptionInstructions: "",
        personalMessage: "",
        deliveryType: "now" as DeliveryType,
        scheduledDateTime: "",
      },
      validators: {
        onChange: eGiftFormSchema,
      },
      onSubmit: async ({ value }) => {
        // Validate file separately before submit
        if (uploadedFile) {
          if (uploadedFile.size > 10 * 1024 * 1024) {
            setFileError("File size must be less than 10MB");
            return;
          }
          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];
          if (!allowedTypes.includes(uploadedFile.type)) {
            setFileError("File must be a PDF or image (JPEG, PNG, WebP)");
            return;
          }
        }

        console.log("Form submitted:", {
          ...value,
          attachedFile: uploadedFile,
        });
      },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setFileError(null);
      if (file) {
        // Validate immediately
        if (file.size > 10 * 1024 * 1024) {
          setFileError("File size must be less than 10MB");
          return;
        }
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          setFileError("File must be a PDF or image (JPEG, PNG, WebP)");
          return;
        }
        setUploadedFile(file);
      }
    };

    const removeFile = () => {
      setUploadedFile(null);
      setFileError(null);
    };

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
      form.reset();
      setUploadedFile(null);
    };

    const handleGoBack = () => {
      handleClose();
      onGoBack?.();
    };

    const handleCancel = () => {
      handleClose();
      onCancel?.();
    };

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
        {!hideTrigger && (trigger || defaultTrigger)}

        <dialog ref={dialogRef} className="modal">
          <div className="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
            {/* Header */}
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
                  <IconGiftCard className="text-primary size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Send E-Gift for: "{post.title}"
                  </h3>
                  <p className="text-base-content/60 text-xs">
                    {post.author.displayName}'s wish
                  </p>
                </div>
              </div>
            </div>

            <CancelReservationBanner
              giftExpiresAt={post.gift.expiresAt}
              onOpenCancelDialog={onOpenCancelDialog}
              handleClose={handleClose}
            />

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6 py-4"
            >
              {/* Gift Type */}
              <form.Field name="giftType">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Gift Type</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value as any)
                      }
                    >
                      {GIFT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {field.state.meta.errors && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors.join(", ")}
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Provider/Brand */}
              <form.Field name="provider">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Provider/Brand
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Amazon, Airbnb, Custom..."
                      className="input input-bordered"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors.join(", ")}
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="divider">Gift Details</div>

              {/* Gift Code */}
              <form.Field name="giftDetails.code">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Code/Key</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCode ? "text" : "password"}
                        placeholder="Enter gift code or voucher key"
                        className="input input-bordered w-full pr-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() => setShowCode(!showCode)}
                      >
                        {showCode ? (
                          <IconEyeOff className="size-4" />
                        ) : (
                          <IconEye className="size-4" />
                        )}
                      </button>
                    </div>
                    {field.state.meta.errors && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors.join(", ")}
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Amount/Value */}
              <form.Field name="giftDetails.amount">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Amount/Value{" "}
                        <span className="text-base-content/60">(optional)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., $50, €100"
                      className="input input-bordered"
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              {/* Expiry Date */}
              <form.Field name="giftDetails.expiryDate">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Expiry Date{" "}
                        <span className="text-base-content/60">(optional)</span>
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className="input input-bordered"
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              {/* Redemption Instructions */}
              <form.Field name="redemptionInstructions">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Redemption Instructions
                      </span>
                    </label>
                    <textarea
                      placeholder="How to use this gift..."
                      className="textarea textarea-bordered h-24"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors.join(", ")}
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </form.Field>

              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Attach File{" "}
                    <span className="text-base-content/60">(optional)</span>
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="btn btn-outline btn-sm flex-1">
                    <IconUpload className="size-4" />
                    Upload PDF/Image
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {uploadedFile && (
                  <div className="bg-base-200 mt-2 flex items-center gap-2 rounded-lg p-2">
                    <span className="flex-1 truncate text-sm">
                      {uploadedFile.name}
                    </span>
                    <span className="text-base-content/60 text-xs">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      onClick={removeFile}
                    >
                      <IconX className="size-3" />
                    </button>
                  </div>
                )}
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Tickets, vouchers, confirmations - max 10MB
                  </span>
                </label>
              </div>

              <div className="divider"></div>

              {/* Personal Message */}
              <form.Field name="personalMessage">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Personal Message
                      </span>
                    </label>
                    <textarea
                      placeholder="Happy birthday! I know you've been dreaming..."
                      className="textarea textarea-bordered h-24"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {field.state.meta.errors.join(", ")}
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Delivery Options */}
              <form.Field name="deliveryType">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Delivery</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="label cursor-pointer gap-2">
                        <input
                          type="radio"
                          className="radio"
                          checked={field.state.value === "now"}
                          onChange={() => {
                            field.handleChange("now");
                            form.setFieldValue("scheduledDateTime", "");
                          }}
                        />
                        <span className="label-text">Send now</span>
                      </label>
                      <label className="label cursor-pointer gap-2">
                        <input
                          type="radio"
                          className="radio"
                          checked={field.state.value === "scheduled"}
                          onChange={() => field.handleChange("scheduled")}
                        />
                        <span className="label-text">Schedule for</span>
                      </label>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Scheduled DateTime */}
              <form.Field name="scheduledDateTime">
                {(field) => {
                  const deliveryType = form.getFieldValue("deliveryType");
                  if (deliveryType !== "scheduled") return null;

                  return (
                    <div className="form-control">
                      <input
                        type="datetime-local"
                        className="input input-bordered"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.state.meta.errors.join(", ")}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                }}
              </form.Field>

              {/* Actions */}
              <div className="modal-action mt-6 flex-col gap-2">
                <button type="submit" className="btn btn-primary w-full">
                  <IconGiftCard className="size-4" />
                  Send Gift 🎁
                </button>

                <div className="flex w-full gap-2">
                  {onGoBack && (
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="btn btn-sm btn-ghost flex-1"
                    >
                      <IconArrowLeft className="size-3" />
                      Change Delivery Method
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-sm btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button onClick={handleClose}>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

SendEGiftDialog.displayName = "SendEGiftDialog";
export default SendEGiftDialog;
