import { IconClock, IconX } from "@tabler/icons-react";
import type { Timestamp } from "firebase/firestore";
import { getTimeRemaining } from "./dialogs-utils";

export default function CancelReservationBanner({
  giftExpiresAt,
  handleClose,
  onOpenCancelDialog,
}: {
  giftExpiresAt?: Timestamp | null;
  handleClose: () => void;
  onOpenCancelDialog: () => void;
}) {
  return (
    <div className="bg-warning/10 mb-4 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconClock className="text-warning size-4" />
          <span className="text-warning text-xs font-medium">
            {giftExpiresAt
              ? getTimeRemaining(giftExpiresAt)
              : "Reservation active"}
          </span>
        </div>
        <button
          onClick={() => {
            handleClose();
            setTimeout(() => onOpenCancelDialog?.(), 150);
          }}
          className="btn btn-ghost btn-xs text-error"
        >
          <IconX className="size-3" />
          Cancel reservation
        </button>
      </div>
    </div>
  );
}
