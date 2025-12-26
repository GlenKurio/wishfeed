import { cn } from "@/lib/utils";
import { IconCheck, IconLoader } from "@tabler/icons-react";
export interface CarrierPackage {
  packageCode: string;
  name: string;
  description?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    units: "inches" | "centimeters";
  };
  maxWeight?: number;
  domestic: boolean;
  international: boolean;
}
interface PackageSelectorProps {
  packages: CarrierPackage[];
  selectedPackageCode: string;
  onSelect: (pkg: CarrierPackage) => void;
  isLoading: boolean;
}

export default function PackageSelector({
  packages,
  selectedPackageCode,
  onSelect,
  isLoading,
}: PackageSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader className="text-primary size-5 animate-spin" />
        <span className="text-base-content/60 ml-2 text-sm">
          Loading packages...
        </span>
      </div>
    );
  }

  return (
    <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
      {packages.map((pkg) => {
        const isSelected = selectedPackageCode === pkg.packageCode;
        const isCustom = pkg.packageCode === "package";

        return (
          <button
            key={pkg.packageCode}
            type="button"
            onClick={() => onSelect(pkg)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-base-300 hover:border-primary/30 hover:bg-base-200/50",
            )}
          >
            <div className="flex w-full items-center gap-2">
              <span className="text-base">{isCustom ? "📦" : "📮"}</span>
              <span className="flex-1 truncate text-sm font-medium">
                {pkg.name}
              </span>
              {isSelected && (
                <IconCheck className="text-primary size-4 shrink-0" />
              )}
            </div>
            {pkg.description && (
              <span className="text-base-content/60 line-clamp-1 text-xs">
                {pkg.description}
              </span>
            )}
            {pkg.maxWeight && (
              <span className="text-base-content/40 text-xs">
                Max: {pkg.maxWeight} lbs
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
