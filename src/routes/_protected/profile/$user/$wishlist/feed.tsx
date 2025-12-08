import { userPostsQueryOptions } from "@/lib/api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  redirect,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Feed from "@/components/feed-posts/feed";

export const Route = createFileRoute(
  "/_protected/profile/$user/$wishlist/feed",
)({
  beforeLoad: async ({ context, params }) => {
    const isDrafts = params.wishlist === "drafts";

    // Ensure the data is loaded
    const data = await context.queryClient.ensureInfiniteQueryData(
      userPostsQueryOptions({
        userId: params.userId,
        published: !isDrafts,
        wishlist: params.wishlist,
      }),
    );

    // Check if there are any posts
    const hasPost = data.pages.some((page) => page.posts.length > 0);

    if (!hasPost) {
      throw redirect({
        to: "/profile/$userId",
        params: { userId: params.userId },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { userId, wishlist } = useParams({
    from: "/_protected/profile/$userId/$wishlist/feed",
  });

  const { postId } = useSearch({
    from: "/_protected/profile/$userId/$wishlist/feed",
  });

  const isDrafts = wishlist === "drafts";

  const { data } = useSuspenseInfiniteQuery(
    userPostsQueryOptions({
      userId: userId,
      published: !isDrafts,
      wishlist,
    }),
  );
  const postRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (postId && postRefs.current.has(postId)) {
      const element = postRefs.current.get(postId);
      element?.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [postId, data]); // Re-run when postId changes or data loads

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="container mx-auto flex items-center justify-center px-4 pb-6 lg:pb-10">
      {allPosts.length === 0 ? (
        <>Empty feed</>
      ) : (
        <Feed posts={allPosts} postRefs={postRefs} />
      )}
    </div>
  );
}
