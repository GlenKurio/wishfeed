import { userPostsQueryOptions } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useUserPosts({
  userId,
  published = true,
  pageSize = 15,
  wishlist,
}: {
  userId: string;
  published?: boolean;
  pageSize?: number;
  wishlist: string;
}) {
  return useInfiniteQuery(
    userPostsQueryOptions({ userId, published, pageSize, wishlist }),
  );
}
