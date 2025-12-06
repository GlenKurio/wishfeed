import PageHeading from "@/components/page-heading";
import { createWishlistSchema } from "@/lib/types";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_protected/profile/$userId/manage-wishlists/$listId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_protected/profile/$userId/manage-wishlists/$listId",
  });
  const pageTitle =
    params.listId === "new" ? "Create Wishlist" : "Edit Wishlist";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: {
      cover_image: "",
      title: "",
      description: "",
      posts: [] as string[],
    },

    validators: {
      onChange: createWishlistSchema,
    },

    onSubmit: async ({ value }) => {
      toast.info("List is being created!");
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const disabled = form.state.isSubmitting || form.state.isValidating;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6">
      <PageHeading title={pageTitle} />

      <div className="flex w-full flex-col items-start gap-4">
        {/* Image File Field with Preview */}

        <form.Field
          name="cover_image"
          children={(field) => {
            const value = field.state.value;
            const hasImage = !!value;

            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
                      Square image recommended. Max size: 5MB
                    </span>
                  </div>
                </div>

                {/* Cover Display with Actions */}
                <div className="mt-2 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {/* Cover Preview */}
                  <div className="avatar shrink-0">
                    <div className="border-primary size-50 rounded-3xl border-2 border-dashed lg:size-80">
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
      </div>
    </div>
  );
}
