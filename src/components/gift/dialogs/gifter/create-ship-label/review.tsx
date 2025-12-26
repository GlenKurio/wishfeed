import type { GiftType } from "@/lib/types";

export default function Review({
  onNext,
  onGoBack,
  onCancel,
  gift,
}: {
  onGoBack: () => void | undefined;
  onCancel: () => void | undefined;
  gift: GiftType;
}) {
  // TODO: here allow to mark as shipped
  return <div>Review</div>;
}
