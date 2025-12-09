import { Icons } from "@/components/icons";
import PageHeading from "@/components/page-heading";
import { useAuth } from "@/hooks/use-auth";
import { useCreateWishlist } from "@/hooks/use-create-wishlist";
import { useDeleteWishlist } from "@/hooks/use-delete-wishlist";
import { userPostsQueryOptions, userWishlistsQueryOptions } from "@/lib/api";
import { createWishlistSchema } from "@/lib/types";
import {
  IconCheck,
  IconFileText,
  IconHeartPlus,
  IconPhoto,
  IconSearch,
  IconTag,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute(
  "/_protected/profile/$userId/manage-wishlists/$listId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuth();
  const params = useParams({
    from: "/_protected/profile/$userId/manage-wishlists/$listId",
  });
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDialogElement>(null);
  const { data: wishlists } = useSuspenseQuery(
    userWishlistsQueryOptions({ userId: user.uid }),
  );
  const currentWishlist = wishlists.find((w) => w.id === params.listId);

  const { data: allPostsData } = useSuspenseInfiniteQuery(
    userPostsQueryOptions({
      userId: user.uid,
      published: true,
      pageSize: 20,
    }),
  );

  // Flatten paginated results into a single array
  const allUserPosts = allPostsData.pages.flatMap((page) => page.posts || page);
  const currentWishlistPostIds = currentWishlist?.posts || [];

  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createWishlist, isPending } = useCreateWishlist();
  const { deleteWishlist, isDeleting } = useDeleteWishlist();

  const form = useForm({
    defaultValues: {
      cover_image: currentWishlist?.cover_image || "",
      title: currentWishlist?.title || "",
      description: currentWishlist?.description || "",
      posts: currentWishlistPostIds,
    },

    validators: {
      onChange: createWishlistSchema,
    },

    onSubmit: async ({ value }) => {
      createWishlist({ wishlistData: value, wishlistId: currentWishlist?.id });
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteList = () => {
    if (!currentWishlist) return;
    deleteWishlist({ wishlist: currentWishlist });
  };

  const disabled =
    isPending ||
    form.state.isSubmitting ||
    form.state.isValidating ||
    isDeleting;

  const isCreating = params.listId === "new";
  const pageTitle = isCreating
    ? "Create Wishlist"
    : `Edit Wishlist "${currentWishlist?.title}"`;

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
        {/* Title Field */}
        <form.Field
          name="title"
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
                    {charCount}/20
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
                    placeholder="Wishlist title"
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
          name="description"
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
                    {charCount}/150
                  </span>
                </label>
                <label
                  className={`textarea textarea-bordered border-base-content/50 flex w-full gap-2 p-3 ${hasError ? "textarea-error border-error" : ""}`}
                >
                  <IconFileText
                    width="20"
                    height="20"
                    className={`text-base-content/50 shrink-0 ${hasError ? "text-error" : ""}`}
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

        <form.Field
          name="posts"
          children={(field) => {
            const selectedPostIds = field.state.value || [];

            // Get actual post objects for selected IDs
            const selectedPosts = allUserPosts.filter(
              (post) => post?.id && selectedPostIds.includes(post.id),
            );

            // Filter posts for search (exclude already selected)
            const availablePosts = allUserPosts.filter(
              (post) => post?.id && !selectedPostIds.includes(post.id),
            );

            const filteredPosts = availablePosts.filter((post) =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()),
            );

            const handleOpenDialog = () => {
              setTempSelectedIds([...selectedPostIds]);
              setSearchQuery("");
              dialogRef.current?.showModal();
            };

            const handleTogglePost = (postId: string) => {
              setTempSelectedIds((prev) =>
                prev.includes(postId)
                  ? prev.filter((id) => id !== postId)
                  : [...prev, postId],
              );
            };
            const handleConfirmSelection = () => {
              field.handleChange(tempSelectedIds);
              dialogRef.current?.close();
            };

            const handleCancelSelection = () => {
              setTempSelectedIds([...selectedPostIds]);
              setSearchQuery("");
              dialogRef.current?.close();
            };

            const handleRemovePost = (postId: string) => {
              field.handleChange(selectedPostIds.filter((id) => id !== postId));
            };

            const hasChanges =
              JSON.stringify([...tempSelectedIds].sort()) !==
              JSON.stringify([...selectedPostIds].sort());

            return (
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between">
                  <label className="label ml-1">
                    <span className="label-text font-medium">
                      Wishes ({selectedPostIds.length})
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenDialog}
                    className="btn btn-sm btn-ghost gap-2"
                    disabled={disabled}
                  >
                    <IconHeartPlus className="h-4 w-4" />
                    Add Wishes
                  </button>
                </div>

                {/* Selected Posts List - Scrollable with max height */}
                {selectedPosts.length > 0 ? (
                  <div className="mb-4 max-h-80 space-y-2 overflow-y-auto pr-2">
                    {selectedPosts.map((post) => {
                      const hasValidImage =
                        post.image && post.image !== "" && !imageError;

                      return (
                        <div
                          key={post.id}
                          className="border-primary/20 bg-base-200 hover:bg-base-300 flex items-center gap-3 rounded-3xl border p-3 transition-colors"
                        >
                          {hasValidImage ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="size-12 rounded-2xl object-cover"
                              onError={() => setImageError(true)}
                            />
                          ) : (
                            <div className="from-base-300 to-primary/30 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br">
                              <IconPhoto className="text-primary size-6" />
                            </div>
                          )}

                          <span className="flex-1 text-sm">{post.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePost(post.id!)}
                            className="btn btn-ghost btn-sm btn-circle btn-error"
                            disabled={disabled}
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-base-content/60 border-base-300 rounded-lg border border-dashed py-8 text-center text-sm">
                    No posts added yet. Click "Add Posts" to get started.
                  </div>
                )}

                {/* Add Posts Dialog */}
                <dialog ref={dialogRef} className="modal">
                  <div className="modal-box max-w-2xl p-2 lg:p-6">
                    <h3 className="mb-4 pt-4 pl-2 text-lg font-bold">
                      Select Posts
                    </h3>

                    {/* Search Bar */}
                    <label className="input input-bordered border-base-content/50 mb-4 flex w-full items-center gap-2">
                      <IconSearch className="text-base-content/50 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full grow"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      )}
                    </label>

                    {/* Available Posts Grid - Scrollable */}
                    <div className="mb-4 max-h-96 space-y-2 overflow-y-auto pr-2">
                      {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => {
                          const isSelected = tempSelectedIds.includes(post.id!);
                          const hasValidImage =
                            post.image && post.image !== "" && !imageError;

                          return (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => handleTogglePost(post.id!)}
                              className={`flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-primary/20 bg-base-200 hover:bg-base-300"
                              }`}
                            >
                              {hasValidImage ? (
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="size-12 rounded-2xl object-cover"
                                  onError={() => setImageError(true)}
                                />
                              ) : (
                                <div className="from-base-300 to-primary/30 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br">
                                  <IconPhoto className="text-primary size-6" />
                                </div>
                              )}
                              <span className="flex-1 text-sm">
                                {post.title}
                              </span>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-colors ${
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-primary/20"
                                }`}
                              >
                                {isSelected && (
                                  <IconCheck className="text-primary-content h-3 w-3" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-base-content/60 py-8 text-center text-sm">
                          {searchQuery
                            ? "No posts found matching your search"
                            : "No posts available"}
                        </div>
                      )}
                    </div>

                    {/* Dialog Actions */}
                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmSelection}
                        className="btn btn-primary"
                        disabled={!hasChanges}
                      >
                        Confirm Selection
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSelection}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Backdrop */}
                  <form method="dialog" className="modal-backdrop">
                    <button type="button" onClick={handleCancelSelection}>
                      Close
                    </button>
                  </form>
                </dialog>
              </div>
            );
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => {
            return (
              <button
                type="submit"
                className="btn btn-block btn-primary mt-2 h-10 text-[14px] font-semibold"
                disabled={!canSubmit || isPending || isDeleting}
                onClick={() => form.handleSubmit()}
              >
                {isPending ? (
                  <>
                    {isCreating
                      ? "Creating wishlist..."
                      : "Updating wishlist..."}{" "}
                    <Icons.wishlist className="size-4" />
                  </>
                ) : (
                  <>
                    {isCreating ? "Create wishlist" : "Update wishlist"}{" "}
                    <Icons.wishlist className="size-4" />
                  </>
                )}
              </button>
            );
          }}
        />
        <button
          className="btn btn-block"
          onClick={() => navigate({ to: ".." })}
        >
          Go back
        </button>
        {!isCreating && (
          <button
            className="btn btn-error btn-block btn-ghost"
            onClick={() => modalRef.current?.showModal()}
            disabled={isDeleting}
          >
            Delete
          </button>
        )}
      </div>

      <dialog ref={modalRef} id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Confirm {currentWishlist?.title} deletion
          </h3>
          <p className="py-10">
            You are about to delete wishlist named {currentWishlist?.title}.
            Please confirm this action. Note: this action cannot be undone!
          </p>
          <div className="flex w-full flex-col gap-2">
            <button className="btn btn-error btn-sm" onClick={handleDeleteList}>
              Delete Wishlist
            </button>
            <button
              className="btn btn-sm btn-ghost w-full"
              onClick={() => {
                modalRef.current?.close();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Cancel</button>
        </form>
      </dialog>
    </div>
  );
}
