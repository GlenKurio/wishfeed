import { cn } from "@/lib/utils";
import { IconCheck } from "@tabler/icons-react";

export interface CarrierOption {
  code: string;
  name: string;
  logo: string;
  color: string;
  bgColor: string;
}

export const CARRIERS: CarrierOption[] = [
  {
    code: "ups",
    name: "UPS",
    logo: "/Ups.webp",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    code: "fedex",
    name: "FedEx",
    logo: "/FedEx.png",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
];

export const DEFAULT_CARRIER = "ups";

interface CarrierSelectorProps {
  selectedCarrier: string;
  onSelect: (carrierCode: string) => void;
  disabled?: boolean;
}
export default function CarrierSelector({
  selectedCarrier,
  onSelect,
  disabled,
}: CarrierSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CARRIERS.map((carrier) => (
        <button
          key={carrier.code}
          type="button"
          onClick={() => onSelect(carrier.code)}
          disabled={disabled}
          className={cn(
            "relative flex cursor-pointer flex-col items-center gap-2 rounded-full border-2 p-1 transition-all",
            selectedCarrier === carrier.code
              ? "border-primary bg-primary/5 shadow-md"
              : "border-base-300 hover:border-primary/30 hover:bg-base-200/50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div
            className={cn(
              "aspec-square flex w-full items-center justify-center text-xl",
            )}
          >
            <img
              src={carrier.logo}
              alt={`Logo of carrier: ${carrier.name}`}
              className="h-10"
            />
          </div>

          {selectedCarrier === carrier.code && (
            <div className="bg-primary text-primary-content absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded-full">
              <IconCheck className="size-3" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
