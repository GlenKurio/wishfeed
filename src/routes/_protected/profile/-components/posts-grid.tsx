import EmptyFrame from "@/components/empty-frame";
import { userPostsQueryOptions, userWishlistsQueryOptions } from "@/lib/api";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { GridHeader } from "./grid-header";

export default function PostsGrid({ userId }: { userId: string }) {
  const { wishlist } = useParams({
    from: "/_protected/profile/$userId/$wishlist",
  });

  const isDrafts = wishlist === "drafts";
  // TODO: implement fetching the next page on scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      userPostsQueryOptions({
        userId: userId,
        published: !isDrafts,
        pageSize: 3,
        wishlist,
      }),
    );

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const { data: wishlists } = useSuspenseQuery(
    userWishlistsQueryOptions({ userId: userId }),
  );
  const currentWishlist = wishlists.find((w) => w.id === wishlist);
  return (
    <div className="-mt-2">
      {wishlist && (
        <GridHeader
          wishlist={wishlist}
          currentWishlist={currentWishlist}
          userId={userId}
        />
      )}
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
