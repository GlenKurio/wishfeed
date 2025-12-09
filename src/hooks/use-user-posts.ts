import { userPostsQueryOptions } from "@/lib/api";
import { USER_POSTS_PAGE_SIZE } from "@/lib/constsnts";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useUserPosts({
  userId,
  published = true,
  pageSize = USER_POSTS_PAGE_SIZE,
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
