import {
  packageDetailsSchema,
  type GiftType,
  type PackageDetails,
  type ShippingRate,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
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
import { useState } from "react";
import CarrierSelector, { CARRIERS, DEFAULT_CARRIER } from "./carrier-selector";
import PackageSelector, { type CarrierPackage } from "./package-selector";
import RateCard from "./rate-card";

const DEFAULT_PACKAGE_INFO: PackageDetails = {
  weight: 1,
  weightUnit: "lb",
  length: 10,
  width: 8,
  height: 4,
  dimensionUnit: "in",
  packageType: "custom",
  requireSignature: false,
  insurance: false,
};

export default function PackageDetailsStep({
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
  const [selectedCarrier, setSelectedCarrier] = useState(
    gift.shipping?.selectedRate?.carrier || DEFAULT_CARRIER,
  );
  const [selectedPackage, setSelectedPackage] = useState<CarrierPackage | null>(
    null,
  );
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(
    gift.shipping?.selectedRate || null,
  );
  const [showRates, setShowRates] = useState(false);

  const form = useForm({
    defaultValues: gift.shipping?.packageDetails || DEFAULT_PACKAGE_INFO,
    validators: {
      onChange: packageDetailsSchema,
    },
    onSubmit: () => {
      onNext();
    },
  });

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
    // fetchRatesMutation.mutate(form.state.values);
  };

  const handleFormChange = () => {
    // Clear rates when form values change
    if (showRates) {
      setShowRates(false);
      setSelectedRate(null);
    }
  };

  const isCustomPackage = selectedPackage?.packageCode === "package";
  const isLoading = false;
  const carrier = CARRIERS.find((c) => c.code === selectedCarrier);

  return (
    <div>
      <div className="flex flex-col gap-4">
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
            packages={[]}
            selectedPackageCode={selectedPackage?.packageCode || ""}
            onSelect={handlePackageSelect}
            isLoading={isLoading}
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
                            unitField.handleChange(
                              e.target.value as "oz" | "lb",
                            );
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
                      Max weight for this package: {selectedPackage.maxWeight}{" "}
                      lbs
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
                              field.handleChange(
                                parseFloat(e.target.value) || 0,
                              );
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
                  <p className="text-info font-medium">
                    Preset Package Selected
                  </p>
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
                        <p className="text-sm font-medium">
                          Signature Required
                        </p>
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
                disabled={isLoading}
                className={cn(
                  "btn btn-block",
                  carrier?.bgColor,
                  carrier?.color,
                )}
              >
                {isLoading ? (
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
                    disabled={isLoading}
                    className="btn btn-ghost btn-xs"
                  >
                    <IconRefresh
                      className={cn("size-3", isLoading && "animate-spin")}
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
      </div>
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
