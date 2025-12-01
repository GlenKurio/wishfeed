import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPostsPaginated } from "../lib/firebase/db";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

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
  return useInfiniteQuery({
    queryKey: ["posts", "user", userId, pageSize, wishlist],
    queryFn: ({ pageParam }) =>
      getUserPostsPaginated({
        userId,
        published,
        pageSize,
        lastDoc: pageParam,
        wishlist,
      }),
    initialPageParam: undefined as
      | QueryDocumentSnapshot<DocumentData>
      | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
  });
}
