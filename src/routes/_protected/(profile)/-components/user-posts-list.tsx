import { useUserPosts } from "../../../../hooks/use-user-posts";
import PostCard from "./post-card";

export default function UserPostsList({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useUserPosts(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <>Error: {error.message}</>;
  // TODO: filter posts here
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      {allPosts.length !== 0 ? (
        <>
          {" "}
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      ) : (
        <>Empty</>
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
