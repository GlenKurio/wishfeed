import type { ShippingRate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RateCardProps {
  rate: ShippingRate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function RateCard({
  rate,
  isSelected,
  onSelect,
}: RateCardProps) {
  const savings = rate.retailRate ? rate.retailRate - rate.rate : 0;

  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-primary/20 shadow-md ring-2"
          : "border-base-300 hover:border-primary/30 hover:bg-base-200/50",
      )}
    >
      <input
        type="radio"
        name="shippingRate"
        checked={isSelected}
        onChange={onSelect}
        className="radio radio-primary radio-sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{rate.service}</p>
          <div className="text-right">
            <p className="text-primary font-bold">${rate.rate.toFixed(2)}</p>
            {savings > 0 && (
              <p className="text-success text-xs">Save ${savings.toFixed(2)}</p>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base-content/60 text-xs">
            {rate.estimatedDays} day{rate.estimatedDays > 1 ? "s" : ""} •{" "}
            {rate.deliveryDate}
          </span>
          {rate.isGuaranteed && (
            <span className="badge badge-xs badge-success">Guaranteed</span>
          )}
        </div>
      </div>
    </label>
  );
}
