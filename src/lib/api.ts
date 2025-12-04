import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { getUserPostsPaginated, getUserProfileById } from "./firebase/db";
import type { UserProfile } from "./types";

export const profileQueryOptions = (userProfileId: string) =>
  queryOptions<UserProfile | null>({
    queryKey: ["user-profile", userProfileId],
    queryFn: () => getUserProfileById({ userId: userProfileId }),
    enabled: !!userProfileId,
    staleTime: 60 * 1000,
  });

export const userPostsQueryOptions = ({
  userId,
  published = true,
  pageSize = 15,
  wishlist,
}: {
  userId: string;
  published?: boolean;
  pageSize?: number;
  wishlist: string;
}) =>
  infiniteQueryOptions({
    queryKey: ["posts", "user", userId, pageSize, wishlist] as const,
    queryFn: ({
      pageParam,
    }: {
      pageParam: QueryDocumentSnapshot<DocumentData> | undefined;
    }) =>
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
    staleTime: 60 * 1000,
  });
