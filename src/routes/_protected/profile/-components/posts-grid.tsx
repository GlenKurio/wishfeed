import EmptyFrame from "@/components/empty-frame";
import { userPostsQueryOptions, userWishlistsQueryOptions } from "@/lib/api";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { GridHeader } from "./grid-header";
import PostCard from "./post-card";

export default function PostsGrid() {
  const { wishlist, userId } = useParams({
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
            <PostCard post={post} userId={userId} wishlist={wishlist} />
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
