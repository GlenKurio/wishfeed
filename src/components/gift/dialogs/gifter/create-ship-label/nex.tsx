import type { GiftType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconCheck,
  IconInfoCircle,
  IconLoader,
  IconPackage,
  IconRefresh,
  IconRuler,
  IconScale,
  IconShieldCheck,
  IconSignature,
  IconTruck,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_PACKAGE_INFO,
  type PackageInfo,
  type ShippingRate,
} from "@/lib/schemas/package-info.schema";

// =============================================================================
// Types
// =============================================================================

export interface CarrierOption {
  code: string;
  name: string;
  logo: string;
  color: string;
  bgColor: string;
}

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

interface PackageDetailsProps {
  onNext: (packageInfo: PackageInfo, selectedRate: ShippingRate) => void;
  onGoBack?: () => void;
  onCancel?: () => void;
  gift: GiftType;
  initialPackageInfo?: PackageInfo;
  initialSelectedRate?: ShippingRate;
  initialCarrier?: string;
}

// =============================================================================
// Constants
// =============================================================================

const CARRIERS: CarrierOption[] = [
  {
    code: "ups",
    name: "UPS",
    logo: "📦",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    code: "fedex",
    name: "FedEx",
    logo: "✈️",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  {
    code: "usps",
    name: "USPS",
    logo: "📬",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
];

const DEFAULT_CARRIER = "ups";

// =============================================================================
// API Functions (replace with real implementations)
// =============================================================================

/**
 * Fetch available packages for a carrier from ShipStation
 * In production: calls your Cloud Function which calls ShipStation's listPackages endpoint
 */
async function fetchCarrierPackages(
  carrierCode: string,
): Promise<CarrierPackage[]> {
  // In production:
  // const result = await httpsCallable(functions, 'getCarrierPackages')({ carrierCode });
  // return result.data.packages;

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data based on carrier - these match ShipStation's actual package codes
  const packages: Record<string, CarrierPackage[]> = {
    ups: [
      {
        packageCode: "package",
        name: "Custom Packaging",
        description: "Your own box or packaging",
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_letter",
        name: "UPS Letter",
        description: 'For documents up to 8.5" x 11"',
        dimensions: { length: 12.5, width: 9.5, height: 0.25, units: "inches" },
        maxWeight: 0.5,
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_express_pak",
        name: "UPS Express Pak",
        description: "Padded pak for small items",
        dimensions: { length: 16, width: 12.75, height: 2, units: "inches" },
        maxWeight: 3,
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_express_box_small",
        name: "UPS Express Box (Small)",
        description: '13" x 11" x 2"',
        dimensions: { length: 13, width: 11, height: 2, units: "inches" },
        maxWeight: 30,
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_express_box_medium",
        name: "UPS Express Box (Medium)",
        description: '16" x 11" x 3"',
        dimensions: { length: 16, width: 11, height: 3, units: "inches" },
        maxWeight: 30,
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_express_box_large",
        name: "UPS Express Box (Large)",
        description: '18" x 13" x 3"',
        dimensions: { length: 18, width: 13, height: 3, units: "inches" },
        maxWeight: 30,
        domestic: true,
        international: true,
      },
      {
        packageCode: "ups_tube",
        name: "UPS Tube",
        description: "For posters, blueprints, etc.",
        dimensions: { length: 38, width: 6, height: 6, units: "inches" },
        maxWeight: 30,
        domestic: true,
        international: true,
      },
    ],
    fedex: [
      {
        packageCode: "package",
        name: "Custom Packaging",
        description: "Your own box or packaging",
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_envelope",
        name: "FedEx Envelope",
        description: "For flat documents",
        dimensions: { length: 12.5, width: 9.5, height: 0.25, units: "inches" },
        maxWeight: 0.5,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_pak",
        name: "FedEx Pak",
        description: "For small items and documents",
        dimensions: { length: 15.5, width: 12, height: 1, units: "inches" },
        maxWeight: 4,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_small_box",
        name: "FedEx Small Box",
        description: '12.25" x 10.9" x 1.5"',
        dimensions: {
          length: 12.25,
          width: 10.9,
          height: 1.5,
          units: "inches",
        },
        maxWeight: 20,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_medium_box",
        name: "FedEx Medium Box",
        description: '13.25" x 11.5" x 2.38"',
        dimensions: {
          length: 13.25,
          width: 11.5,
          height: 2.38,
          units: "inches",
        },
        maxWeight: 20,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_large_box",
        name: "FedEx Large Box",
        description: '17.5" x 12.38" x 3"',
        dimensions: { length: 17.5, width: 12.38, height: 3, units: "inches" },
        maxWeight: 20,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_extra_large_box",
        name: "FedEx Extra Large Box",
        description: '11.88" x 11" x 10.75"',
        dimensions: {
          length: 11.88,
          width: 11,
          height: 10.75,
          units: "inches",
        },
        maxWeight: 20,
        domestic: true,
        international: true,
      },
      {
        packageCode: "fedex_tube",
        name: "FedEx Tube",
        description: "For posters, blueprints, etc.",
        dimensions: { length: 38, width: 6, height: 6, units: "inches" },
        maxWeight: 20,
        domestic: true,
        international: true,
      },
    ],
    usps: [
      {
        packageCode: "package",
        name: "Custom Packaging",
        description: "Your own box or packaging",
        domestic: true,
        international: true,
      },
      {
        packageCode: "flat_rate_envelope",
        name: "Flat Rate Envelope",
        description: '12.5" x 9.5" - One low price',
        dimensions: { length: 12.5, width: 9.5, height: 0.75, units: "inches" },
        maxWeight: 70,
        domestic: true,
        international: false,
      },
      {
        packageCode: "flat_rate_padded_envelope",
        name: "Flat Rate Padded Envelope",
        description: '12.5" x 9.5" - Padded protection',
        dimensions: { length: 12.5, width: 9.5, height: 1, units: "inches" },
        maxWeight: 70,
        domestic: true,
        international: false,
      },
      {
        packageCode: "small_flat_rate_box",
        name: "Small Flat Rate Box",
        description: '8.69" x 5.44" x 1.75"',
        dimensions: {
          length: 8.69,
          width: 5.44,
          height: 1.75,
          units: "inches",
        },
        maxWeight: 70,
        domestic: true,
        international: true,
      },
      {
        packageCode: "medium_flat_rate_box",
        name: "Medium Flat Rate Box",
        description: '11.25" x 8.75" x 6"',
        dimensions: { length: 11.25, width: 8.75, height: 6, units: "inches" },
        maxWeight: 70,
        domestic: true,
        international: true,
      },
      {
        packageCode: "large_flat_rate_box",
        name: "Large Flat Rate Box",
        description: '12.25" x 12.25" x 6"',
        dimensions: { length: 12.25, width: 12.25, height: 6, units: "inches" },
        maxWeight: 70,
        domestic: true,
        international: true,
      },
      {
        packageCode: "regional_rate_box_a",
        name: "Regional Rate Box A",
        description: "Distance-based pricing, smaller box",
        dimensions: {
          length: 10.125,
          width: 7.125,
          height: 5,
          units: "inches",
        },
        maxWeight: 15,
        domestic: true,
        international: false,
      },
      {
        packageCode: "regional_rate_box_b",
        name: "Regional Rate Box B",
        description: "Distance-based pricing, larger box",
        dimensions: {
          length: 12.25,
          width: 10.5,
          height: 5.5,
          units: "inches",
        },
        maxWeight: 20,
        domestic: true,
        international: false,
      },
    ],
  };

  return packages[carrierCode] || [];
}

/**
 * Fetch shipping rates for the selected carrier and package
 */
async function fetchShippingRates(
  giftId: string,
  carrierCode: string,
  packageInfo: PackageInfo,
): Promise<ShippingRate[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Mock rates based on carrier
  const baseRates: Record<string, ShippingRate[]> = {
    ups: [
      {
        rateId: "ups_ground",
        carrier: "UPS",
        carrierCode: "ups",
        service: "Ground",
        serviceCode: "ups_ground",
        rate: 12.49,
        estimatedDays: 5,
        deliveryDate: getDeliveryDate(5),
        isGuaranteed: false,
      },
      {
        rateId: "ups_3day",
        carrier: "UPS",
        carrierCode: "ups",
        service: "3 Day Select",
        serviceCode: "ups_3_day_select",
        rate: 19.99,
        estimatedDays: 3,
        deliveryDate: getDeliveryDate(3),
        isGuaranteed: true,
      },
      {
        rateId: "ups_2day",
        carrier: "UPS",
        carrierCode: "ups",
        service: "2nd Day Air",
        serviceCode: "ups_2nd_day_air",
        rate: 29.99,
        estimatedDays: 2,
        deliveryDate: getDeliveryDate(2),
        isGuaranteed: true,
      },
      {
        rateId: "ups_next_day",
        carrier: "UPS",
        carrierCode: "ups",
        service: "Next Day Air",
        serviceCode: "ups_next_day_air",
        rate: 49.99,
        estimatedDays: 1,
        deliveryDate: getDeliveryDate(1),
        isGuaranteed: true,
      },
    ],
    fedex: [
      {
        rateId: "fedex_ground",
        carrier: "FedEx",
        carrierCode: "fedex",
        service: "Ground",
        serviceCode: "fedex_ground",
        rate: 11.99,
        estimatedDays: 5,
        deliveryDate: getDeliveryDate(5),
        isGuaranteed: false,
      },
      {
        rateId: "fedex_express_saver",
        carrier: "FedEx",
        carrierCode: "fedex",
        service: "Express Saver",
        serviceCode: "fedex_express_saver",
        rate: 22.49,
        estimatedDays: 3,
        deliveryDate: getDeliveryDate(3),
        isGuaranteed: true,
      },
      {
        rateId: "fedex_2day",
        carrier: "FedEx",
        carrierCode: "fedex",
        service: "2Day",
        serviceCode: "fedex_2day",
        rate: 28.99,
        estimatedDays: 2,
        deliveryDate: getDeliveryDate(2),
        isGuaranteed: true,
      },
      {
        rateId: "fedex_overnight",
        carrier: "FedEx",
        carrierCode: "fedex",
        service: "Standard Overnight",
        serviceCode: "fedex_standard_overnight",
        rate: 45.99,
        estimatedDays: 1,
        deliveryDate: getDeliveryDate(1),
        isGuaranteed: true,
      },
    ],
    usps: [
      {
        rateId: "usps_ground_advantage",
        carrier: "USPS",
        carrierCode: "usps",
        service: "Ground Advantage",
        serviceCode: "usps_ground_advantage",
        rate: 5.99,
        retailRate: 7.5,
        estimatedDays: 5,
        deliveryDate: getDeliveryDate(5),
        isGuaranteed: false,
      },
      {
        rateId: "usps_priority",
        carrier: "USPS",
        carrierCode: "usps",
        service: "Priority Mail",
        serviceCode: "usps_priority_mail",
        rate: 8.95,
        retailRate: 12.8,
        estimatedDays: 2,
        deliveryDate: getDeliveryDate(2),
        isGuaranteed: false,
      },
      {
        rateId: "usps_express",
        carrier: "USPS",
        carrierCode: "usps",
        service: "Priority Mail Express",
        serviceCode: "usps_priority_mail_express",
        rate: 26.95,
        retailRate: 32.5,
        estimatedDays: 1,
        deliveryDate: getDeliveryDate(1),
        isGuaranteed: true,
      },
    ],
  };

  return (baseRates[carrierCode] || []).sort((a, b) => a.rate - b.rate);
}

function getDeliveryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

async function savePackageInfo(
  giftId: string,
  carrierCode: string,
  packageInfo: PackageInfo,
  selectedRate: ShippingRate,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Saving:", { giftId, carrierCode, packageInfo, selectedRate });
}

// =============================================================================
// Sub-components
// =============================================================================

interface CarrierSelectorProps {
  selectedCarrier: string;
  onSelect: (carrierCode: string) => void;
  disabled?: boolean;
}

function CarrierSelector({
  selectedCarrier,
  onSelect,
  disabled,
}: CarrierSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CARRIERS.map((carrier) => (
        <button
          key={carrier.code}
          type="button"
          onClick={() => onSelect(carrier.code)}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all",
            selectedCarrier === carrier.code
              ? "border-primary bg-primary/5 shadow-md"
              : "border-base-300 hover:border-primary/30 hover:bg-base-200/50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl text-xl",
              carrier.bgColor,
            )}
          >
            {carrier.logo}
          </div>
          <span className={cn("text-sm font-semibold", carrier.color)}>
            {carrier.name}
          </span>

          {selectedCarrier === carrier.code && (
            <div className="bg-primary text-primary-content absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full">
              <IconCheck className="size-3" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

interface PackageSelectorProps {
  packages: CarrierPackage[];
  selectedPackageCode: string;
  onSelect: (pkg: CarrierPackage) => void;
  isLoading: boolean;
}

function PackageSelector({
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

interface RateCardProps {
  rate: ShippingRate;
  isSelected: boolean;
  onSelect: () => void;
}

function RateCard({ rate, isSelected, onSelect }: RateCardProps) {
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

// =============================================================================
// Main Component
// =============================================================================

export default function PackageDetails({
  onNext,
  onGoBack,
  onCancel,
  gift,
  initialPackageInfo,
  initialSelectedRate,
  initialCarrier,
}: PackageDetailsProps) {
  // State
  const [selectedCarrier, setSelectedCarrier] = useState(
    initialCarrier || DEFAULT_CARRIER,
  );
  const [selectedPackage, setSelectedPackage] = useState<CarrierPackage | null>(
    null,
  );
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(
    initialSelectedRate || null,
  );
  const [showRates, setShowRates] = useState(false);

  // Form
  const form = useForm<PackageInfo>({
    defaultValues: initialPackageInfo || DEFAULT_PACKAGE_INFO,
    onSubmit: async ({ value }) => {
      if (!selectedRate) {
        toast.error("Please select a shipping rate");
        return;
      }

      await saveMutation.mutateAsync({
        giftId: gift.id,
        carrierCode: selectedCarrier,
        packageInfo: value,
        selectedRate,
      });
    },
  });

  // Queries & Mutations
  const packagesQuery = useQuery({
    queryKey: ["carrierPackages", selectedCarrier],
    queryFn: () => fetchCarrierPackages(selectedCarrier),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const fetchRatesMutation = useMutation({
    mutationFn: (packageInfo: PackageInfo) =>
      fetchShippingRates(gift.id, selectedCarrier, packageInfo),
    onSuccess: (data) => {
      setRates(data);
      setShowRates(true);
      if (data.length > 0 && !selectedRate) {
        setSelectedRate(data[0]);
      }
      toast.success(`Found ${data.length} shipping options`);
    },
    onError: () => {
      toast.error("Failed to fetch rates. Please try again.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: {
      giftId: string;
      carrierCode: string;
      packageInfo: PackageInfo;
      selectedRate: ShippingRate;
    }) =>
      savePackageInfo(
        data.giftId,
        data.carrierCode,
        data.packageInfo,
        data.selectedRate,
      ),
    onSuccess: () => {
      onNext(form.state.values, selectedRate!);
    },
    onError: () => {
      toast.error("Failed to save. Please try again.");
    },
  });

  // Auto-select first package (custom) when packages load
  useEffect(() => {
    if (
      packagesQuery.data &&
      packagesQuery.data.length > 0 &&
      !selectedPackage
    ) {
      const customPkg = packagesQuery.data.find(
        (p) => p.packageCode === "package",
      );
      if (customPkg) {
        setSelectedPackage(customPkg);
      }
    }
  }, [packagesQuery.data, selectedPackage]);

  // Handlers
  const handleCarrierChange = (carrierCode: string) => {
    setSelectedCarrier(carrierCode);
    setSelectedPackage(null);
    setRates([]);
    setSelectedRate(null);
    setShowRates(false);
  };

  const handlePackageSelect = (pkg: CarrierPackage) => {
    setSelectedPackage(pkg);
    setShowRates(false);
    setSelectedRate(null);

    // Auto-fill dimensions for preset packages
    if (pkg.dimensions) {
      form.setFieldValue("length", pkg.dimensions.length);
      form.setFieldValue("width", pkg.dimensions.width);
      form.setFieldValue("height", pkg.dimensions.height);
      form.setFieldValue(
        "dimensionUnit",
        pkg.dimensions.units === "inches" ? "in" : "cm",
      );
    }

    // Update package type in form
    form.setFieldValue("packageType", pkg.packageCode as any);
  };

  const handleGetRates = () => {
    setSelectedRate(null);
    fetchRatesMutation.mutate(form.state.values);
  };

  const handleFormChange = () => {
    // Clear rates when form values change
    if (showRates) {
      setShowRates(false);
      setSelectedRate(null);
    }
  };

  const isCustomPackage = selectedPackage?.packageCode === "package";
  const isLoading = fetchRatesMutation.isPending || saveMutation.isPending;
  const carrier = CARRIERS.find((c) => c.code === selectedCarrier);

  return (
    <div className="space-y-5">
      {/* Step 1: Carrier Selection */}
      <div>
        <label className="label">
          <span className="label-text flex items-center gap-2 font-semibold">
            <IconTruck className="text-primary size-4" />
            Select Carrier
          </span>
        </label>
        <CarrierSelector
          selectedCarrier={selectedCarrier}
          onSelect={handleCarrierChange}
          disabled={isLoading}
        />
      </div>

      {/* Step 2: Package Type Selection */}
      <div>
        <label className="label">
          <span className="label-text flex items-center gap-2 font-semibold">
            <IconPackage className="text-primary size-4" />
            {carrier?.name} Package Type
          </span>
        </label>
        <PackageSelector
          packages={packagesQuery.data || []}
          selectedPackageCode={selectedPackage?.packageCode || ""}
          onSelect={handlePackageSelect}
          isLoading={packagesQuery.isLoading}
        />
      </div>

      {/* Step 3: Package Details (shown after package selection) */}
      {selectedPackage && (
        <>
          {/* Weight Input */}
          <form.Field name="weight">
            {(field) => (
              <div>
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <IconScale className="text-primary size-4" />
                    Package Weight
                  </span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(parseFloat(e.target.value) || 0);
                      handleFormChange();
                    }}
                    className="input input-bordered join-item flex-1"
                    placeholder="Enter weight"
                  />
                  <form.Field name="weightUnit">
                    {(unitField) => (
                      <select
                        value={unitField.state.value}
                        onChange={(e) => {
                          unitField.handleChange(e.target.value as "oz" | "lb");
                          handleFormChange();
                        }}
                        className="select select-bordered join-item w-20"
                      >
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                      </select>
                    )}
                  </form.Field>
                </div>
                {selectedPackage.maxWeight && (
                  <p className="text-base-content/50 mt-1 ml-1 text-xs">
                    Max weight for this package: {selectedPackage.maxWeight} lbs
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Dimensions - Only for custom packaging */}
          {isCustomPackage ? (
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2 font-semibold">
                  <IconRuler className="text-primary size-4" />
                  Dimensions (L × W × H)
                </span>
                <form.Field name="dimensionUnit">
                  {(unitField) => (
                    <select
                      value={unitField.state.value}
                      onChange={(e) => {
                        unitField.handleChange(e.target.value as "in" | "cm");
                        handleFormChange();
                      }}
                      className="select select-bordered select-xs"
                    >
                      <option value="in">inches</option>
                      <option value="cm">cm</option>
                    </select>
                  )}
                </form.Field>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["length", "width", "height"] as const).map((dimension) => (
                  <form.Field key={dimension} name={dimension}>
                    {(field) => (
                      <div className="form-control">
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(parseFloat(e.target.value) || 0);
                            handleFormChange();
                          }}
                          className="input input-bordered w-full"
                        />
                        <label className="label py-0.5">
                          <span className="label-text-alt w-full text-center capitalize">
                            {dimension}
                          </span>
                        </label>
                      </div>
                    )}
                  </form.Field>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-info/10 flex items-start gap-2 rounded-2xl p-3">
              <IconInfoCircle className="text-info mt-0.5 size-4 shrink-0" />
              <div className="text-xs">
                <p className="text-info font-medium">Preset Package Selected</p>
                <p className="text-base-content/70">
                  {selectedPackage.dimensions &&
                    `Dimensions: ${selectedPackage.dimensions.length}" × ${selectedPackage.dimensions.width}" × ${selectedPackage.dimensions.height}"`}
                </p>
              </div>
            </div>
          )}

          {/* Shipping Options */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text flex items-center gap-2 font-semibold">
                <IconBox className="text-primary size-4" />
                Additional Options
              </span>
            </label>

            <form.Field name="requireSignature">
              {(field) => (
                <label className="border-base-300 hover:bg-base-200/50 flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-base-200 rounded-xl p-2">
                      <IconSignature className="text-base-content/70 size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Signature Required</p>
                      <p className="text-base-content/60 text-xs">
                        Recipient must sign for delivery
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.checked);
                      handleFormChange();
                    }}
                    className="toggle toggle-primary toggle-sm"
                  />
                </label>
              )}
            </form.Field>

            <form.Field name="insurance">
              {(field) => (
                <div>
                  <label className="border-base-300 hover:bg-base-200/50 flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-base-200 rounded-xl p-2">
                        <IconShieldCheck className="text-base-content/70 size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Shipping Insurance
                        </p>
                        <p className="text-base-content/60 text-xs">
                          Protection against loss or damage
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.checked);
                        handleFormChange();
                      }}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </label>

                  {field.state.value && (
                    <form.Field name="insuranceValue">
                      {(valueField) => (
                        <div className="mt-2 ml-14">
                          <label className="label py-1">
                            <span className="label-text text-xs">
                              Declared Value
                            </span>
                          </label>
                          <div className="join">
                            <span className="join-item bg-base-200 flex items-center px-3 text-sm">
                              $
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={valueField.state.value || ""}
                              onChange={(e) => {
                                valueField.handleChange(
                                  parseFloat(e.target.value) || undefined,
                                );
                                handleFormChange();
                              }}
                              className="input input-bordered input-sm join-item w-32"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}
                    </form.Field>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Get Rates Button */}
          {!showRates && (
            <button
              type="button"
              onClick={handleGetRates}
              disabled={fetchRatesMutation.isPending}
              className={cn("btn btn-block", carrier?.bgColor, carrier?.color)}
            >
              {fetchRatesMutation.isPending ? (
                <>
                  <IconLoader className="size-4 animate-spin" />
                  Fetching {carrier?.name} Rates...
                </>
              ) : (
                <>
                  <IconTruck className="size-4" />
                  Get {carrier?.name} Rates
                </>
              )}
            </button>
          )}

          {/* Shipping Rates */}
          {showRates && rates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <IconTruck className="text-primary size-4" />
                    {carrier?.name} Shipping Options
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleGetRates}
                  disabled={fetchRatesMutation.isPending}
                  className="btn btn-ghost btn-xs"
                >
                  <IconRefresh
                    className={cn(
                      "size-3",
                      fetchRatesMutation.isPending && "animate-spin",
                    )}
                  />
                  Refresh
                </button>
              </div>

              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {rates.map((rate) => (
                  <RateCard
                    key={rate.rateId}
                    rate={rate}
                    isSelected={selectedRate?.rateId === rate.rateId}
                    onSelect={() => setSelectedRate(rate)}
                  />
                ))}
              </div>

              {/* Selected Rate Summary */}
              {selectedRate && (
                <div className="bg-success/10 flex items-center justify-between rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <IconCheck className="text-success size-5" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedRate.carrier} {selectedRate.service}
                      </p>
                      <p className="text-base-content/60 text-xs">
                        Est. delivery: {selectedRate.deliveryDate}
                      </p>
                    </div>
                  </div>
                  <p className="text-success text-lg font-bold">
                    ${selectedRate.rate.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Rates */}
          {showRates && rates.length === 0 && (
            <div className="bg-warning/10 rounded-2xl p-4 text-center">
              <p className="text-warning font-medium">No rates available</p>
              <p className="text-base-content/60 mt-1 text-sm">
                Please check your package details and try again
              </p>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => form.handleSubmit()}
          disabled={isLoading || !selectedRate}
          className={cn(
            "btn btn-block",
            selectedRate ? "btn-primary" : "btn-disabled",
          )}
        >
          {saveMutation.isPending ? (
            <>
              <IconLoader className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue to Payment
              <IconArrowRight className="size-4" />
            </>
          )}
        </button>

        <div className="flex w-full gap-2">
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              disabled={isLoading}
              className="btn btn-ghost btn-sm flex-1"
            >
              <IconArrowLeft className="size-3" />
              Change Method
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn btn-ghost btn-sm flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
