import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useAuth } from "../../../../../hooks/use-auth";
import { useUserPosts } from "../../../../../hooks/use-user-posts";
import Feed from "../../../../../components/feed-posts/feed";

export const Route = createFileRoute("/_protected/profile/$userId/feed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const authUser = useAuth();
  const { userId } = useParams({ from: "/_protected/profile/$userId/feed/" });
  const isOwner = authUser?.uid === userId;
  const { wishlist } = useSearch({ from: "/_protected/profile/$userId/feed/" });

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
    <div className="container mx-auto flex items-center justify-center px-4 py-6 lg:py-10">
      <Feed posts={allPosts} />
    </div>
  );
}
