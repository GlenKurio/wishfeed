import { useAuth } from "@/hooks/use-auth";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { profileQueryOptions } from "@/lib/api";
import { validateHandle } from "@/lib/firebase/db";
import { updateUserProfileSchema } from "@/lib/types";
import { isoToDateInput } from "@/lib/utils";
import {
  IconAt,
  IconCake,
  IconCheck,
  IconDeviceFloppy,
  IconMessage,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";

// TODO: add ratelimit to form submission and after submission navigate to profile page
// TODO: add loading states to fields and buttons
export const Route = createFileRoute(
  "/_protected/profile/$userId/edit-profile/",
)({
  beforeLoad: ({ context, params }) => {
    const authUserId = context.user?.uid;
    const profileId = params.userId;

    if (authUserId !== profileId) {
      throw redirect({
        to: "/profile/$userId/edit-profile",
        params: { userId: authUserId },
      });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuth();
  const { data: userProfile } = useSuspenseQuery(profileQueryOptions(user.uid));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { editProfile } = useEditProfile();
  const form = useForm({
    defaultValues: {
      photoUrl: userProfile?.photoURL || user.photoURL || "",
      displayName: userProfile?.displayName || "",
      handle: userProfile?.handle || "",
      bio: userProfile?.bio || "",
      birthday: isoToDateInput(userProfile?.birthday) || "",
      isPublic: userProfile?.isPublic ?? true,
    },

    validators: {
      onChange: updateUserProfileSchema,
      // onChangeAsyncDebounceMs: 500,
      // onChangeAsync: async ({ value }) => {
      //   if (!value.handle || value.handle === userProfile?.handle) {
      //     return;
      //   }

      //   // First, check sync validation (format, length, etc.)
      //   const syncValidation = updateUserProfileSchema.shape.handle.safeParse(
      //     value.handle,
      //   );
      //   // If sync validation fails, don't check availability
      //   if (!syncValidation.success || !userProfile) {
      //     return;
      //   }

      //   const isAvailable = await validateHandle(value.handle, userProfile);

      //   console.log("IS AVAILABLE: ", isAvailable);

      //   if (!isAvailable) {
      //     return {
      //       fields: {
      //         handle: "This handle is already taken. Please try another one.",
      //       },
      //     };
      //   }

      //   return;
      // },
    },

    onSubmit: async ({ value }) => {
      console.log("Form submitted with:", value);
      editProfile({ updatedUserProfile: value });
      toast.success("Profile updated successfully!");
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex w-full max-w-3xl flex-col">
      <h2 className="mb-8 text-3xl font-bold">Edit Your Profile</h2>
      <div className="flex flex-col gap-6">
        <div className="flex w-full flex-col items-start gap-4 lg:gap-6">
          {/* Avatar Field  */}
          <form.Field
            name="photoUrl"
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
                        Profile Avatar
                      </span>
                    </label>
                    {/* Helper Text */}
                    <div className="label">
                      <span className="label-text-alt text-base-content/60 text-xs">
                        Square image recommended. Max size: 5MB
                      </span>
                    </div>
                  </div>
                  {/* Avatar Display with Actions */}
                  <div className="mt-2 flex flex-col items-center gap-4 lg:flex-row">
                    {/* Avatar Preview */}
                    <div className="avatar shrink-0">
                      <div className="size-20 rounded-full">
                        {hasImage ? (
                          <img
                            src={value}
                            className="h-full w-full object-cover"
                            alt="Avatar preview"
                          />
                        ) : (
                          <div className="from-primary to-secondary flex h-full w-full items-center justify-center bg-linear-to-br">
                            <IconPhoto className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full flex-col gap-2 lg:w-auto">
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="btn btn-sm gap-2"
                      >
                        <IconUpload className="h-4 w-4" />
                        {hasImage ? "Change Avatar" : "Select Avatar"}
                      </button>

                      {hasImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="btn btn-ghost btn-sm btn-error gap-2"
                        >
                          <IconTrash className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef} // Attach the ref here
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                      onBlur={field.handleBlur}
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
          {/* Display Name Field */}
          <form.Field
            name="displayName"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0]?.message : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Full Name
                    </span>
                  </label>
                  <label
                    className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconUser
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      // disabled={isPending}
                      placeholder="Enter your full name"
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

          {/* Handle Field */}
          <form.Field
            name="handle"
            validators={{
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                // Skip if empty or unchanged
                if (!value || value === userProfile?.handle) {
                  return;
                }

                // Check if sync validation passes first
                const syncValidation =
                  updateUserProfileSchema.shape.handle.safeParse(value);
                if (!syncValidation.success || !userProfile) {
                  return; // Let sync validation handle the error
                }

                // Now check availability
                const isAvailable = await validateHandle(value, userProfile);

                console.log("IS AVAILABLE: ", isAvailable); // Debug

                if (!isAvailable) {
                  // Return error as plain string
                  return "This handle is already taken. Please try another one.";
                }

                return; // Valid - return undefined
              },
            }}
            children={(field) => {
              const { isTouched, errors, isValidating } = field.state.meta;

              const hasError = isTouched && errors.length > 0;

              console.log("Field state:", {
                isValidating,
                value: field.state.value,
                hasError,
                errors,
              });

              // Fix: errors array contains strings directly
              const message = hasError
                ? typeof errors[0] === "string"
                  ? errors[0]
                  : errors[0]?.message
                : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Handle
                    </span>
                    {isValidating && (
                      <span className="label-text-alt text-info text-xs">
                        Checking availability...
                      </span>
                    )}
                  </label>
                  <label
                    className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconAt
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      placeholder="handle"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      className={`grow ${hasError ? "placeholder:text-error/50" : ""}`}
                    />
                    {isValidating && (
                      <span className="loading loading-spinner loading-xs text-primary" />
                    )}
                    {!isValidating && field.state.value && !hasError && (
                      <IconCheck className="text-primary" size={20} />
                    )}
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

          {/* Bio Field */}
          <form.Field
            name="bio"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0]?.message : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Bio (Optional)
                    </span>
                  </label>
                  <label
                    className={`textarea textarea-bordered border-base-content flex w-full items-start gap-2 ${hasError ? "textarea-error border-error" : ""}`}
                  >
                    <IconMessage
                      width="20"
                      height="20"
                      className={`mt-1 ${hasError ? "text-error" : ""}`}
                    />
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      // disabled={isPending}
                      placeholder="Tell us about yourself..."
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

          {/* Birthday Field */}
          <form.Field
            name="birthday"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0]?.message : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Birthday (Optional)
                    </span>
                  </label>
                  <label
                    className={`input input-bordered border-base-content flex w-full items-center gap-2 ${hasError ? "input-error border-error" : ""}`}
                  >
                    <IconCake
                      width="20"
                      height="20"
                      className={hasError ? "text-error" : ""}
                    />

                    <input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value || ""} // Handle empty string
                      // disabled={isPending}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={hasError}
                      max={new Date().toISOString().split("T")[0]} // Prevent future dates
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

          {/* Privacy Toggle Field */}
          <form.Field
            name="isPublic"
            children={(field) => {
              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text text-sm font-medium lg:text-base">
                      Profile visibility
                    </span>
                  </label>
                  <div className="border-base-content flex w-full items-center justify-between rounded-full border-2 px-3 py-1">
                    <div className="flex items-center gap-3">
                      <IconWorld width="20" height="20" />
                      <div>
                        {field.state.value === true ? (
                          <>
                            {" "}
                            <div className="text-sm font-medium lg:text-base">
                              Public
                            </div>
                            <div className="text-base-content/60 text-xs">
                              Users can find and view your profile
                            </div>
                          </>
                        ) : (
                          <>
                            {" "}
                            <div className="text-sm font-medium lg:text-base">
                              Private
                            </div>
                            <div className="text-base-content/60 text-xs">
                              Users cannot find and view your profile
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={field.state.value}
                      // disabled={isPending}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                </div>
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
          <form.Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => {
              return (
                <button
                  type="submit"
                  className="btn btn-primary font-semibold"
                  disabled={!canSubmit || false}
                  onClick={() => form.handleSubmit()}
                >
                  {false ? (
                    <>
                      <IconDeviceFloppy className="size-4" />
                      Updating profile...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="size-4" />
                      Update profile
                    </>
                  )}
                </button>
              );
            }}
          />
          <Link
            to="/profile/$userId"
            params={{ userId: user.uid }}
            className="btn"
            onClick={() => {
              form.reset();
            }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
