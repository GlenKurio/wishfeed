import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  getUserPostsPaginated,
  getUserProfileById,
  getUserWishlists,
} from "./firebase/db";
import type { UserProfile } from "./types";
import { USER_POSTS_PAGE_SIZE } from "./constsnts";

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
  pageSize = USER_POSTS_PAGE_SIZE,
  wishlist = "all",
}: {
  userId: string;
  published?: boolean;
  pageSize?: number;
  wishlist?: string;
}) =>
  infiniteQueryOptions({
    queryKey: ["posts", "user", userId, wishlist] as const,
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

export const userWishlistsQueryOptions = ({ userId }: { userId: string }) =>
  queryOptions({
    queryKey: ["wishlists", "user", userId],
    queryFn: () => getUserWishlists({ userId }),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
