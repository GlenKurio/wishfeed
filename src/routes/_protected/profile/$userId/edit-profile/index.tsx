import { useAuth } from "@/hooks/use-auth";
import { profileQueryOptions } from "@/lib/api";
import { updateUserProfileSchema } from "@/lib/types";
import {
  IconDeviceFloppy,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";

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

// export const updateProfileAvatarSchema = z.object({
//   photoUrl: z.string(),
// });

function RouteComponent() {
  const user = useAuth();
  const { data: userProfile } = useSuspenseQuery(profileQueryOptions(user.uid));
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

  const form = useForm({
    defaultValues: {
      photoUrl: userProfile?.photoURL || user.photoURL || "",
      displayName: userProfile?.displayName || "",
      handle: userProfile?.handle || "",
      bio: userProfile?.bio || "",
      birthday: userProfile?.birthday || null,
      isPublic: userProfile?.isPublic ?? true,
    },
    validators: {
      onChange: updateUserProfileSchema,
    },

    onSubmit: ({ value }) => {
      // Handle your form submission logic here
      console.log("Form submitted with:", value);
      toast.success("Profile updated successfully!");
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex w-full flex-col">
      <h2 className="mb-4 text-2xl font-bold">Edit Profile</h2>
      <div>
        <div className="flex w-full flex-col items-start gap-4">
          {/* Avatar Field with TanStack Form */}
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
                      <span className="label-text font-medium">
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
                  <div className="mt-2 flex flex-col items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="avatar shrink-0">
                      <div className="size-24 rounded-full">
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
                    <div className="flex w-full flex-col gap-2">
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
                    <span className="label-text font-medium">Full Name</span>
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
        </div>
        <div>
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
