import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import type { UserProfile } from "./types";
import { USER_POSTS_PAGE_SIZE } from "./constsnts";
import { searchFollowers, searchFollowing } from "./firebase/functions";
import {
  getUserFollowers,
  getUserFollowing,
  getUserProfileById,
} from "./firebase/firestore/users";
import { getUserPostsPaginated } from "./firebase/firestore/posts";
import { getUserWishlists } from "./firebase/firestore/wishlists";

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

export const userFollowersQueryOptions = ({
  userId,

  pageSize = 50,
}: {
  userId: string;

  pageSize?: number;
}) =>
  infiniteQueryOptions({
    queryKey: ["users", userId, "followers"],

    queryFn: (
      {
        pageParam,
      }: {
        pageParam: QueryDocumentSnapshot<DocumentData> | undefined;
      }, // pageParam is the lastDoc from Firestore
    ) =>
      getUserFollowers({
        userId,
        pageSize,
        lastDoc: pageParam,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,

    enabled: !!userId, // Only run if we have a userId
  });
export const userFollowingQueryOptions = ({
  userId,

  pageSize = 50,
}: {
  userId: string;

  pageSize?: number;
}) =>
  infiniteQueryOptions({
    queryKey: ["users", userId, "following"],

    queryFn: (
      {
        pageParam,
      }: {
        pageParam: QueryDocumentSnapshot<DocumentData> | undefined;
      }, // pageParam is the lastDoc from Firestore
    ) =>
      getUserFollowing({
        userId,
        pageSize,
        lastDoc: pageParam,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,

    enabled: !!userId, // Only run if we have a userId
  });

export const searchFollowersQueryOptions = ({
  searchTerm,
  userId,
}: {
  searchTerm: string;
  userId: string;
}) =>
  queryOptions({
    queryKey: ["users", userId, "followers", { search: searchTerm }],
    queryFn: () => searchFollowers(searchTerm),
    enabled: !!userId && !!searchTerm && searchTerm !== "",
  });

export const searchFollowingQueryOptions = ({
  searchTerm,
  userId,
}: {
  searchTerm: string;
  userId: string;
}) =>
  queryOptions({
    queryKey: ["users", userId, "followers", { search: searchTerm }],
    queryFn: () => searchFollowing(searchTerm),
    enabled: !!userId && !!searchTerm && searchTerm !== "",
  });

export const getExistingGiftQueryOptions = () =>
  queryOptions({
    queryKey: ["gift", postId, user?.uid],
    queryFn: async (): Promise<GiftType | null> => {
      if (!postId || !user?.uid) return null;

      const giftId = `${postId}_${user.uid}`;
      const giftRef = doc(db, "gifts", giftId);
      const giftSnap = await getDoc(giftRef);

      if (!giftSnap.exists()) return null;

      return { id: giftSnap.id, ...giftSnap.data() } as GiftType;
    },
    enabled: !!postId && !!user?.uid && isGifter,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
