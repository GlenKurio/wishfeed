import { useState } from "react";
import { IconPlus, IconX, IconSearch } from "@tabler/icons-react";

// Add this component inside your RouteComponent, after the description field

export default function PostsManagement({
  form,
  disabled,
}: {
  form: any;
  disabled: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPost, setIsAddingPost] = useState(false);

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
  ];

  return (
    <form.Field
      name="posts"
      children={(field) => {
        const selectedPostIds = field.state.value || [];
        const selectedPosts = availablePosts.filter((post) =>
          selectedPostIds.includes(post.id),
        );

        const unselectedPosts = availablePosts.filter(
          (post) => !selectedPostIds.includes(post.id),
        );

        const filteredPosts = unselectedPosts.filter((post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        const handleAddPost = (postId: string) => {
          field.handleChange([...selectedPostIds, postId]);
          setSearchQuery("");
          setIsAddingPost(false);
        };

        const handleRemovePost = (postId: string) => {
          field.handleChange(selectedPostIds.filter((id) => id !== postId));
        };

        return (
          <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
              <label className="label ml-1">
                <span className="label-text font-medium">
                  Posts ({selectedPostIds.length})
                </span>
              </label>
              {!isAddingPost && (
                <button
                  type="button"
                  onClick={() => setIsAddingPost(true)}
                  className="btn btn-sm btn-ghost gap-2"
                  disabled={disabled}
                >
                  <IconPlus className="h-4 w-4" />
                  Add Post
                </button>
              )}
            </div>

            {/* Selected Posts List */}
            {selectedPosts.length > 0 ? (
              <div className="mb-4 space-y-2">
                {selectedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border-base-300 bg-base-200 flex items-center gap-3 rounded-3xl border p-3"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-12 w-12 rounded-2xl object-cover"
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
              <div className="text-base-content/60 py-9 text-center text-sm">
                No posts added to this wishlist yet. Click "Add Post" to get
                started.
              </div>
            )}

            {/* Add Post Interface */}
            {isAddingPost && (
              <div className="border-base-300 bg-base-200 rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <label className="input input-bordered flex flex-1 items-center gap-2">
                    <IconSearch className="h-4 w-4 opacity-70" />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="grow"
                      disabled={disabled}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPost(false);
                      setSearchQuery("");
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>

                {/* Available Posts */}
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => handleAddPost(post.id)}
                        className="border-base-300 bg-base-100 hover:bg-base-200 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                        disabled={disabled}
                      >
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <span className="flex-1 text-sm">{post.title}</span>
                        <IconPlus className="h-4 w-4 opacity-50" />
                      </button>
                    ))
                  ) : (
                    <div className="text-base-content/60 py-4 text-center text-sm">
                      {searchQuery
                        ? "No posts found matching your search"
                        : "No more posts available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

// Usage: Add this component in your form, after the description field:
// <PostsManagement form={form} disabled={disabled} />
