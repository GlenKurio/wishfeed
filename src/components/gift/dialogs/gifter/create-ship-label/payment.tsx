import type { GiftType } from "@/lib/types";
import { IconArrowLeft } from "@tabler/icons-react";

export default function Payment({
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
  return (
    <div>
      Payment {/* Actions */}
      <div className="modal-action flex-col gap-2">
        <button className="btn btn-sm btn-primary w-full" onClick={onNext}>
          Submit Payment
        </button>

        <div className="flex w-full gap-2">
          {onGoBack && (
            <button onClick={onGoBack} className="btn btn-sm btn-ghost flex-1">
              <IconArrowLeft className="size-3" /> Back to package details
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
