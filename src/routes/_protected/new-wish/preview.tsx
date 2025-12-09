import {
  IconBuildingStore,
  IconCurrencyDollar,
  IconFileText,
  IconHeartShare,
  IconLink,
  IconPhoto,
  IconTag,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import {
  clearScrapedWish,
  loadScrapedWish,
  SCRAPED_WISH_KEY,
} from "../../../lib/scraped-wish-storage";
import {
  newWishSchema,
  type ScrapedWishDataWithOriginalUrl,
} from "../../../lib/types";
import { useCreatePost } from "../../../hooks/use-create-post";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_protected/new-wish/preview")({
  loader: ({ context: { queryClient } }) => {
    // 1. Try cache
    const cached = queryClient.getQueryData([
      SCRAPED_WISH_KEY,
    ]) as ScrapedWishDataWithOriginalUrl;
    if (cached) return cached;

    // 2. Fallback to localStorage
    const persisted = loadScrapedWish();
    if (persisted) {
      queryClient.setQueryData([SCRAPED_WISH_KEY], persisted);
      return persisted;
    }

    // 3. Nothing found
    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const scrapedWish = Route.useLoaderData();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPost, isPending } = useCreatePost();

  const form = useForm({
    defaultValues: {
      wish_url: scrapedWish?.original_url || "",
      wish_title: scrapedWish?.wish_title || "",
      wish_description: scrapedWish?.wish_description || "",
      wish_image: scrapedWish?.wish_image || "",
      wish_price: scrapedWish?.wish_price || 0,
      brand: scrapedWish?.brand || "",
      isPublished: false,
    },

    validators: {
      onChange: newWishSchema,
      // onBlur: newWishSchema,
    },
    onSubmit: async ({ value }) => {
      createPost({ ...value, isPublished: true });
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveToDrafts = () => {
    createPost({
      ...form.state.values,
      isPublished: false,
    });
  };

  const handleDiscard = () => {
    form.reset();
    clearScrapedWish();
    queryClient.setQueryData([SCRAPED_WISH_KEY], null);
    navigate({
      to: "/new-wish",
    });
  };

  const disabled =
    isPending || form.state.isSubmitting || form.state.isValidating;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <picture className="mx-auto max-w-[200px] lg:mb-10 lg:max-w-[300px]">
        <img
          src="/create-wish/step-2.png"
          className="aspect-auto h-full w-full"
          width="300"
          height="400"
          alt="Step 2"
        />
      </picture>

      <div className="flex w-full flex-col items-start gap-4">
        {/* Image File Field with Preview */}
        <form.Field
          name="wish_image"
          children={(field) => {
            const value = field.state.value;
            const hasImage = !!value;

            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const ACCEPTED_IMAGE_TYPES = [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ];

            const handleFileChange = async (
              e: React.ChangeEvent<HTMLInputElement>,
            ) => {
              const file = e.target.files?.[0];

              if (file) {
                // Validate file type
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  field.form.setFieldMeta(field.name, (prev) => ({
                    ...prev,
                    errors: [
                      "Please upload a valid image (JPEG, JPG, PNG, or WEBP)",
                    ],
                    isTouched: true,
                  }));
                  field.handleChange("");
                  return;
                }

                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                  field.form.setFieldMeta(field.name, (prev) => ({
                    ...prev,
                    errors: ["Image size must be less than 5MB"],
                    isTouched: true,
                  }));
                  field.handleChange("");
                  return;
                }

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

            const message = isTouched ? errors[0]?.message : null;

            return (
              <div className="flex w-full flex-col">
                <div className="flex flex-col">
                  <label className="label">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Wishlist Cover
                    </span>
                  </label>
                  {/* Helper Text */}
                  <div className="label">
                    <span className="label-text-alt text-base-content/60 text-xs">
                      Square image recommended. Max size: 10MB
                    </span>
                  </div>
                </div>

                {/* Cover Display with Actions */}
                <div className="mt-2 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {/* Cover Preview */}
                  <div className="avatar shrink-0">
                    <div className="border-base-content/50 size-50 rounded-3xl border-2 border-dashed lg:size-80">
                      {hasImage ? (
                        <img
                          src={value}
                          className="h-full w-full rounded-3xl object-cover"
                          alt="Cover preview"
                        />
                      ) : (
                        <div className="from-base-300 to-primary/30 flex h-full w-full items-center justify-center rounded-3xl bg-linear-to-br">
                          <IconPhoto className="text-primary h-12 w-12 lg:h-24 lg:w-24" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex w-full flex-col gap-2 md:w-auto">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="btn btn-sm gap-2 sm:w-auto"
                      disabled={disabled}
                    >
                      <IconUpload className="h-4 w-4" />
                      {hasImage ? "Change Cover" : "Select Cover"}
                    </button>

                    {hasImage && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={handleRemoveImage}
                        className="btn btn-ghost btn-sm btn-error gap-2 sm:w-auto"
                      >
                        <IconTrash className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    onBlur={field.handleBlur}
                    disabled={disabled}
                  />
                </div>

                {/* Error Message */}
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
                  className={`input input-bordered border-base-content/50 flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                >
                  <IconLink
                    width="20"
                    height="20"
                    className={hasError ? "text-error" : "text-base-content/50"}
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
                    disabled={disabled}
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
                  className={`input input-bordered border-base-content/50 flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                >
                  <IconTag
                    width="20"
                    height="20"
                    className={hasError ? "text-error" : "text-base-content/50"}
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
                    disabled={disabled}
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
                  className={`textarea textarea-bordered border-base-content/50 flex w-full gap-2 p-3 ${hasError ? "textarea-error border-error" : ""}`}
                >
                  <IconFileText
                    width="20"
                    height="20"
                    className={`shrink-0 ${hasError ? "text-error" : "text-base-content/50"}`}
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
                    disabled={disabled}
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
                    className={`input input-bordered border-base-content/50 flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconBuildingStore
                      width="20"
                      height="20"
                      className={
                        hasError ? "text-error" : "text-base-content/50"
                      }
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
                      disabled={disabled}
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
                    className={`input input-bordered border-base-content/50 flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconCurrencyDollar
                      width="20"
                      height="20"
                      className={
                        hasError ? "text-error" : "text-base-content/50"
                      }
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      placeholder="29.99"
                      step="0.01" // Allows decimal values
                      min="0" // Prevents negative values
                      onChange={(e) => field.handleChange(+e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                      disabled={disabled}
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
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => {
            return (
              <button
                type="submit"
                className="btn btn-block btn-primary mt-2 h-10 text-[14px] font-semibold"
                disabled={!canSubmit || isPending}
                onClick={() => form.handleSubmit()}
              >
                {isPending ? (
                  <>
                    Publishing your wish...{" "}
                    <IconHeartShare className="size-4" />
                  </>
                ) : (
                  <>
                    Publish wish <IconHeartShare className="size-4" />
                  </>
                )}
              </button>
            );
          }}
        />

        <button
          onClick={() => {
            if (scrapedWish || form.state.isDirty) {
              modalRef.current?.showModal();
            } else {
              navigate({
                to: "/new-wish",
              });
            }
          }}
          className="btn btn-block btn-error btn-ghost h-10 text-[14px] font-semibold"
        >
          {scrapedWish || form.state.isDirty ? (
            <>
              Discard <IconTrash className="size-4" />
            </>
          ) : (
            <>Go back</>
          )}
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

      {isPending && (
        <div className="absolute inset-0 flex min-h-screen items-center justify-center p-4 backdrop-blur-xl">
          <div className="card bg-base-300 border-neutral/5 w-full max-w-md border p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <picture className="max-w-[250px]">
                <img
                  src="/create-wish/post.png"
                  alt="Love letter with wings"
                  className="animate-ring"
                />
              </picture>

              <h1 className="mb-2 text-2xl font-bold">Posting your wish...</h1>
              <p className="text-base-content/70 text-sm">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
