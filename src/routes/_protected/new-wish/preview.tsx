import {
  IconBuildingStore,
  IconCurrencyDollar,
  IconFileText,
  IconHeartShare,
  IconLink,
  IconPhoto,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { useCreatePost } from "../../../hooks/use-create-post";
import { loadScrapedWish } from "../../../lib/scraped-wish-storage";
import {
  newWishSchema,
  type ScrapedWishDataWithOriginalUrl,
} from "../../../lib/types";

export const Route = createFileRoute("/_protected/new-wish/preview")({
  loader: ({ context: { queryClient } }) => {
    // 1. Try cache
    const cached = queryClient.getQueryData([
      "scraped-wish",
    ]) as ScrapedWishDataWithOriginalUrl;
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

function RouteComponent() {
  const scrapedWish = Route.useLoaderData();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDialogElement>(null);

  const { createPost } = useCreatePost();

  const form = useForm({
    defaultValues: {
      wish_url: scrapedWish?.original_url || "",
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
    onSubmit: async ({ value }) => {
      createPost(value);
    },
  });

  {
    /* TODO: prompt user to submit deletion of the post. Allow to save it to drafts. */
  }
  const handleSaveToDrafts = () => {};

  const handleDiscard = () => {
    form.reset();
    navigate({
      to: "/new-wish",
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <picture className="mx-auto max-w-[150px] lg:mb-10 lg:max-w-[300px]">
        <img src="/create-wish/step-2.png" className="h-full w-full" />
      </picture>

      <div className="flex w-full flex-col items-start gap-4">
        {/* Image File Field with Preview */}
        <form.Field
          name="wish_image"
          children={(field) => {
            const value = field.state.value;

            const hasImage = !!value;

            const handleFileChange = async (
              e: React.ChangeEvent<HTMLInputElement>,
            ) => {
              const file = e.target.files?.[0];
              if (file) {
                // Convert to base64 string
                const reader = new FileReader();
                reader.onloadend = () => {
                  field.handleChange(reader.result as string); // Store base64 string
                };
                reader.readAsDataURL(file);
              }
            };

            const handleRemoveImage = () => {
              field.handleChange("");
            };

            const { isTouched, errors } = field.state.meta;
            const hasError = isTouched && errors.length > 0;
            const message = isTouched ? errors[0]?.message : null;

            return (
              <div className="w-full md:max-w-[250px]">
                <label className="label mb-1 ml-1">
                  <span className="label-text font-medium">
                    Wish Cover Image
                  </span>
                </label>

                {hasImage ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2">
                    <img
                      src={field.state.value}
                      className="h-full w-full object-cover"
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-error btn-circle btn-sm absolute top-2 right-2"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    className={`hover:bg-base-200 flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                      hasError ? "border-error" : "border-base-content"
                    }`}
                  >
                    <IconPhoto width="48" height="48" />
                    <p className="mb-2 text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs">PNG, JPG, GIF up to 10MB</p>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      onBlur={field.handleBlur}
                    />
                  </label>
                )}

                {message && (
                  <div className="text-error mt-1.5 ml-1.5 text-xs">
                    {message}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Url Field */}
        <form.Field
          name="wish_url"
          children={(field) => {
            const { isTouched, errors } = field.state.meta;
            const hasError = isTouched && errors.length > 0;
            const message = isTouched ? errors[0]?.message : null;

            return (
              <div className="w-full">
                <label className="label mb-1 ml-1">
                  <span className="label-text font-medium">URL</span>
                </label>
                <label
                  className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                >
                  <IconLink
                    width="20"
                    height="20"
                    className={hasError ? "text-error" : ""}
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value}
                    placeholder="Link to where to find your wish"
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
                <label className="label mb-1 ml-1">
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
                <label className="label mb-1 ml-1">
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
                    className={`shrink-0 ${hasError ? "text-error" : ""}`}
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
                  <label className="label mb-1 ml-1">
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
                  <label className="label mb-1 ml-1">
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

        <button
          onClick={() => {
            if (form.state.isDirty) {
              modalRef.current?.showModal();
            } else {
              navigate({
                to: "/new-wish",
              });
            }
          }}
          className="btn btn-block btn-error btn-ghost h-10 text-[14px] font-semibold"
        >
          Discard cahnges <IconTrash className="size-4" />
        </button>
      </div>

      <dialog ref={modalRef} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Hello!</h3>
          <p className="py-16">
            Press ESC key or click the button below to close
          </p>
          <div className="flex w-full flex-col gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveToDrafts}
            >
              Save to drafts
            </button>
            <button
              className="btn btn-error btn-sm btn-ghost"
              onClick={handleDiscard}
            >
              Delete wish
            </button>

            <form method="dialog" className="w-full">
              <button className="btn btn-sm btn-ghost w-full">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
