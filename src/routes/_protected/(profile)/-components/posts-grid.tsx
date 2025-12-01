import { useSearch } from "@tanstack/react-router";
import { useUserPosts } from "../../../../hooks/use-user-posts";
import PostCard from "./post-card";

export default function PostsGrid({ userId }: { userId: string }) {
  const { wishlist } = useSearch({
    from: "/_protected/(profile)/profile",
  }); // adjust route path

  const isDrafts = wishlist === "drafts";
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useUserPosts({ userId, wishlist, published: !isDrafts });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <>Error: {error.message}</>;

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      {allPosts.length !== 0 ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {allPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all hover:opacity-90"
            >
              <img
                src={post.image || "/placeholder.svg"}
                alt={`Post ${post.id}`}
                className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="border-border flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            No posts in this collection yet
          </p>
        </div>
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
