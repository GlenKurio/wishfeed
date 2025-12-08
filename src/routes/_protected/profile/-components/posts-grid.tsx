import EmptyFrame from "@/components/empty-frame";
import { userPostsQueryOptions } from "@/lib/api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "@tanstack/react-router";

export default function PostsGrid({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) {
  const { wishlist } = useParams({
    from: "/_protected/profile/$userId/$wishlist",
  });

  const isDrafts = wishlist === "drafts";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      userPostsQueryOptions({
        userId: userId,
        published: !isDrafts,
        wishlist,
      }),
    );

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="">
      {allPosts.length !== 0 ? (
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {allPosts.map((post) => (
            <Link
              key={post.id}
              to="/profile/$userId/$wishlist/feed"
              params={{ userId, wishlist }}
              search={{ postId: post.id }}
              className="group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-3xl transition-all hover:opacity-90"
            >
              <img
                src={post.image || "/placeholder.svg"}
                alt={`Post ${post.id}`}
                className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyFrame text={"No posts in this collection yet."} />
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
