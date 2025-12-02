import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@/hooks/use-get-user-profile";
import { useForm } from "@tanstack/react-form";
import { updateUserProfileSchema } from "@/lib/types";
import {
  IconPhoto,
  IconUpload,
  IconTrash,
  IconUser,
  IconAt,
  IconDeviceFloppy,
  IconMessage,
  IconCake,
  IconWorld,
} from "@tabler/icons-react";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { toast } from "sonner";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DialogContent } from "@/components/ui/dialog";

export default function EditProfileModal({
  modalRef,
}: {
  modalRef?: React.RefObject<HTMLDialogElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const authUser = useAuth();
  const { data } = useGetUserProfile({ userProfileId: authUser.uid });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { editProfile, isPending } = useEditProfile();

  const form = useForm({
    defaultValues: {
      displayName: data?.displayName || authUser.displayName || "",
      handle: data?.handle || "",
      avatar: data?.photoURL || "",
      bio: data?.bio || "",
      birthday: data?.birthday || "",
      isPublic: data?.isPublic || false,
    },

    validators: {
      onChange: updateUserProfileSchema,
    },

    onSubmit: ({ value }) => {
      if (form.state.isDefaultValue) {
        toast.success("Profile successfully updated!");
        //   modalRef.current?.close();
        return;
      }
      editProfile({ updatedUserProfile: value });
      // modalRef.current?.close();
    },
  });

  return (
    <DialogContent className="bg-base-100">
      <div className="">
        <h3 className="mb-4 text-lg font-bold">Edit Profile</h3>

        <div className="space-y-4 pb-4">
          {/* Avatar Field with TanStack Form */}
          <form.Field
            name="avatar"
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
                if (!file) return;

                // Validate file type
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  field.form.setFieldMeta(field.name, (prev) => ({
                    ...prev,
                    errors: [
                      "Please upload a valid image (JPEG, JPG, PNG, or WEBP)",
                    ],
                    isTouched: true,
                  }));
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  return;
                }

                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                  field.form.setFieldMeta(field.name, (prev) => ({
                    ...prev,
                    errors: ["Image size must be less than 5MB"],
                    isTouched: true,
                  }));
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  return;
                }

                // Clear any previous errors
                field.form.setFieldMeta(field.name, (prev) => ({
                  ...prev,
                  errors: [],
                }));

                // Convert to base64 string
                const reader = new FileReader();
                reader.onloadend = () => {
                  field.handleChange(reader.result as string);
                };
                reader.readAsDataURL(file);
              };

              const handleRemoveImage = () => {
                field.handleChange("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              };

              const handleUploadClick = () => {
                fileInputRef.current?.click();
              };

              const { isTouched, errors } = field.state.meta;

              const message = isTouched ? errors[0] : null;

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
                      ref={fileInputRef}
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
              const message = isTouched ? errors[0] : null;

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
                      disabled={isPending}
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
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0] : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text font-medium">Handle</span>
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
                      disabled={isPending}
                      placeholder="@username"
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

          {/* Bio Field */}
          <form.Field
            name="bio"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0] : null;

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text font-medium">Bio</span>
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
                      disabled={isPending}
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

          <form.Field
            name="birthday"
            children={(field) => {
              const { isTouched, errors } = field.state.meta;
              const hasError = isTouched && errors.length > 0;
              const message = isTouched ? errors[0] : null;

              //   const formatDisplayDate = (isoDate: string) => {
              //     if (!isoDate) return "Pick a date";
              //     try {
              //       const date = new Date(isoDate);
              //       return date.toLocaleDateString("en-US", {
              //         year: "numeric",
              //         month: "long",
              //         day: "numeric",
              //       });
              //     } catch {
              //       return "Pick a date";
              //     }
              //   };

              return (
                <div className="flex w-full flex-col">
                  <label className="label mb-1 ml-1">
                    <span className="label-text font-medium">Birthday</span>
                  </label>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <button
                        id="date"
                        className="btn btn-outline w-48 justify-between font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

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
                <div className="border-base-content flex w-full items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <IconWorld width="20" height="20" />
                    <div>
                      <div className="font-medium">Public Profile</div>
                      <div className="text-base-content/60 text-xs">
                        Allow others to view your profile
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={field.state.value}
                    disabled={isPending}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    onBlur={field.handleBlur}
                  />
                </div>
              );
            }}
          />
        </div>

        {/* Form Actions */}
        <div className="modal-action flex-col gap-2 sm:flex-row">
          <form.Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => {
              return (
                <button
                  type="submit"
                  className="btn btn-primary font-semibold"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? (
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

          <form method="dialog" className="w-full sm:w-auto">
            <button
              className="btn btn-ghost w-full"
              onClick={() => {
                form.reset();
                //     modalRef.current?.close();
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
}
