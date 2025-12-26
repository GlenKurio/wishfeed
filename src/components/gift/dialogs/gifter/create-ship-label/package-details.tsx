import type { GiftType } from "@/lib/types";
import { IconArrowLeft } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";

export default function PackageDetails({
  onNext,
  onGoBack,
  onCancel,
  gift,
}: {
  onNext: () => void;
  onGoBack: () => void | undefined;
  onCancel: () => void | undefined;
  gift: GiftType;
}) {
  const form = useForm({
    onSubmit: () => {
      onNext();
    },
  });
  return (
    <div>
      PackageDetails
      {/* Actions */}
      <div className="modal-action flex-col gap-2">
        <button
          className="btn btn-sm btn-primary w-full"
          onClick={form.handleSubmit}
        >
          Continue to Payment
        </button>

        <div className="flex w-full gap-2">
          {onGoBack && (
            <button onClick={onGoBack} className="btn btn-sm btn-ghost flex-1">
              <IconArrowLeft className="size-3" /> Change Delivery Method
            </button>
          )}
          <button onClick={onCancel} className="btn btn-sm btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
