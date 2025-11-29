import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPostsPaginated } from "../lib/firebase/db";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function useUserPosts(
  userId: string,
  pageSize: number = 15,
  published: boolean = true,
) {
  return useInfiniteQuery({
    queryKey: ["posts", "user", userId, pageSize],
    queryFn: ({ pageParam }) =>
      getUserPostsPaginated(userId, published, pageSize, pageParam),
    initialPageParam: undefined as
      | QueryDocumentSnapshot<DocumentData>
      | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
  });
}
