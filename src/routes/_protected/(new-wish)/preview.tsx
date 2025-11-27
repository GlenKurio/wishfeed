import { createFileRoute } from "@tanstack/react-router";
import { loadScrapedWish } from "../../../lib/scraped-wish-storage";
import type { ScrapedWishData } from "../../../lib/firebase/types";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  IconBuildingStore,
  IconCopyX,
  IconCurrencyDollar,
  IconFileText,
  IconHeartShare,
  IconPhoto,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";

export const Route = createFileRoute("/_protected/(new-wish)/preview")({
  loader: ({ context: { queryClient } }) => {
    // 1. Try cache
    const cached = queryClient.getQueryData([
      "scraped-wish",
    ]) as ScrapedWishData;
    if (cached) return cached;

    // 2. Fallback to localStorage
    const persisted = loadScrapedWish();
    if (persisted) {
      queryClient.setQueryData(["scraped-wish"], persisted);
      return persisted;
    }

    // 3. Nothing found
    return null;
  },
  component: RouteComponent,
});
const newWishSchema = z.object({
  wish_image: z
    .url({ message: "Please provide a valid image URL." })
    .trim()
    .min(1, { message: "Image URL is required." }),
  wish_title: z
    .string()
    .trim()
    .min(1, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  wish_description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." })
    .max(250, { message: "Description cannot exceed 250 characters." }),
  wish_price: z.string().trim().min(1, { message: "Price is required." }),
  brand: z
    .string()
    .trim()
    .min(1, { message: "Brand is required." })
    .max(50, { message: "Brand cannot exceed 50 characters." }),
});

function RouteComponent() {
  const scrapedWish = Route.useLoaderData();

  const form = useForm({
    defaultValues: {
      wish_title: scrapedWish?.wish_title || "",
      wish_description: scrapedWish?.wish_description || "",
      wish_image: scrapedWish?.wish_image || "",
      wish_price: scrapedWish?.wish_price || "",
      brand: scrapedWish?.brand || "",
    },

    validators: {
      onChange: newWishSchema,
      onBlur: newWishSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Submitting wish:", value);
      // TODO: Implement wish submission logic
    },
  });
  // TODO:
  // - add image uploader and preview
  // - ADd tooltips to all fields with description

  return (
    <div className="flex h-full w-full flex-col gap-6 lg:gap-8">
      <picture className="mx-auto max-w-[150px] lg:mb-10 lg:max-w-[300px]">
        <img src="/create-wish/step-2.png" className="h-full w-full" />
      </picture>

      <div className="flex w-full flex-col items-center gap-4">
        {/* Image URL Field */}
        <form.Field
          name="wish_image"
          children={(field) => {
            const { isTouched, errors } = field.state.meta;
            const hasError = isTouched && errors.length > 0;
            const message = isTouched ? errors[0]?.message : null;

            return (
              <div className="w-full">
                <label className="label">
                  <span className="label-text font-medium">Product Image</span>
                </label>
                <label
                  className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                >
                  <IconPhoto
                    width="20"
                    height="20"
                    className={hasError ? "text-error" : ""}
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError}
                    className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                  />
                </label>
                {message && (
                  <div className="text-error mt-1.5 ml-1.5 text-xs">
                    {message}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Title Field */}
        <form.Field
          name="wish_title"
          children={(field) => {
            const { isTouched, errors } = field.state.meta;
            const hasError = isTouched && errors.length > 0;
            const message = isTouched ? errors[0]?.message : null;
            const charCount = field.state.value.length;

            return (
              <div className="w-full">
                <label className="label">
                  <span className="label-text font-medium">Title</span>
                  <span className="label-text-alt text-neutral/70">
                    {charCount}/100
                  </span>
                </label>
                <label
                  className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                >
                  <IconTag
                    width="20"
                    height="20"
                    className={hasError ? "text-error" : ""}
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    placeholder="Product title"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError}
                    className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                  />
                </label>
                {message && (
                  <div className="text-error mt-1.5 ml-1.5 text-xs">
                    {message}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Description Field */}
        <form.Field
          name="wish_description"
          children={(field) => {
            const { isTouched, errors } = field.state.meta;
            const hasError = isTouched && errors.length > 0;
            const message = isTouched ? errors[0]?.message : null;
            const charCount = field.state.value.length;

            return (
              <div className="w-full">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                  <span className="label-text-alt text-neutral/70">
                    {charCount}/250
                  </span>
                </label>
                <label
                  className={`textarea textarea-bordered border-base-content flex w-full gap-2 p-3 ${hasError ? "textarea-error border-error" : ""}`}
                >
                  <IconFileText
                    width="20"
                    height="20"
                    className={`mt-1 shrink-0 ${hasError ? "text-error" : ""}`}
                  />
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder="Describe your wish..."
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={hasError}
                    rows={3}
                    className={`grow resize-none ${hasError ? "placeholder:text-error/50" : ""}`}
                  />
                </label>
                {message && (
                  <div className="text-error mt-1.5 ml-1.5 text-xs">
                    {message}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Price and Brand Fields Row */}
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          {/* Brand Field */}
          <form.Field
            name="brand"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0]?.message : null;

              return (
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text font-medium">Brand</span>
                  </label>
                  <label
                    className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconBuildingStore
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      placeholder="Brand name"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                    />
                  </label>
                  {message && (
                    <div className="text-error mt-1.5 ml-1.5 text-xs">
                      {message}
                    </div>
                  )}
                </div>
              );
            }}
          />

          {/* Price Field */}
          <form.Field
            name="wish_price"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0]?.message : null;

              return (
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text font-medium">Price</span>
                  </label>
                  <label
                    className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconCurrencyDollar
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      placeholder="29.99"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                    />
                  </label>
                  {message && (
                    <div className="text-error mt-1.5 ml-1.5 text-xs">
                      {message}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isTouched]}
          children={([canSubmit, isTouched]) => {
            return (
              <button
                type="submit"
                className="btn btn-block btn-primary mt-2 h-10 text-[14px] font-semibold"
                disabled={!canSubmit || !isTouched}
                onClick={() => form.handleSubmit()}
              >
                Publish Wish <IconHeartShare className="size-4" />
              </button>
            );
          }}
        />
        {/* TODO: prompt user to submit deletion of the post. Allow to save it to drafts. */}
        <button className="btn btn-block btn-error btn-ghost h-10 text-[14px] font-semibold">
          Discard cahnges <IconTrash className="size-4" />
        </button>
      </div>
    </div>
  );
}
