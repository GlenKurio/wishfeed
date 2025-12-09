import { IconCheck, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";

// Add this component inside your RouteComponent, after the description field

export default function PostsManagement({
  form,
  disabled,
}: {
  form: any;
  disabled: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  // Mock function - replace with your actual API call to fetch available posts
  const availablePosts = [
    {
      id: "post1",
      title: "Amazing Product 1",
      image: "https://placehold.co/100",
    },
    { id: "post2", title: "Cool Item 2", image: "https://placehold.co/100" },
    { id: "post3", title: "Must Have 3", image: "https://placehold.co/100" },
    { id: "post4", title: "Great Find 4", image: "https://placehold.co/100" },
    { id: "post5", title: "Nice Thing 5", image: "https://placehold.co/100" },
    { id: "post6", title: "Awesome Item 6", image: "https://placehold.co/100" },
  ];

  return (
    <form.Field
      name="posts"
      children={(field) => {
        const selectedPostIds = field.state.value || [];
        const selectedPosts = availablePosts.filter((post) =>
          selectedPostIds.includes(post.id),
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
                  Posts ({selectedPostIds.length})
                </span>
              </label>
              <button
                type="button"
                onClick={handleOpenDialog}
                className="btn btn-sm btn-ghost gap-2"
                disabled={disabled}
              >
                <IconPlus className="h-4 w-4" />
                Add Posts
              </button>
            </div>

            {/* Selected Posts List - Scrollable with max height */}
            {selectedPosts.length > 0 ? (
              <div className="mb-4 max-h-80 space-y-2 overflow-y-auto pr-2">
                {selectedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border-base-300 bg-base-100 flex items-center gap-3 rounded-lg border p-3"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <span className="flex-1 text-sm">{post.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePost(post.id)}
                      className="btn btn-ghost btn-sm btn-circle"
                      disabled={disabled}
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-base-content/60 border-base-300 rounded-lg border border-dashed py-8 text-center text-sm">
                No posts added yet. Click "Add Posts" to get started.
              </div>
            )}

            {/* Add Posts Dialog */}
            <dialog ref={dialogRef} className="modal">
              <div className="modal-box max-w-2xl">
                <h3 className="mb-4 text-lg font-bold">
                  Select Posts ({tempSelectedIds.length} selected)
                </h3>

                {/* Search Bar */}
                <label className="input input-bordered mb-4 flex items-center gap-2">
                  <IconSearch className="h-4 w-4 opacity-70" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="grow"
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
                      const isSelected = tempSelectedIds.includes(post.id);
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => handleTogglePost(post.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-base-300 bg-base-100 hover:bg-base-200"
                          }`}
                        >
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="flex-1 text-sm">{post.title}</span>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-base-300"
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
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmSelection}
                    className="btn btn-primary flex-1"
                    disabled={!hasChanges}
                  >
                    Confirm Selection ({tempSelectedIds.length})
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
  );
}

// Usage: Add this component in your form, after the description field:
// <PostsManagement form={form} disabled={disabled} />
