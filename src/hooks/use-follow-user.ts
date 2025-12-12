import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useGetUserProfile } from "./use-get-user-profile";
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
  sendFollowRequest as sendFollowRequestApi,
  cancelFollowRequest as cancelFollowRequestApi,
  isFollowing,
  hasFollowRequest,
} from "@/lib/firebase/db";
import { useQuery } from "@tanstack/react-query";

export function useFollowUser({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const authUser = useAuth();
  const { data: targetUserProfile } = useGetUserProfile({
    userProfileId: userId,
  });

  // Check if following (from subcollection)
  const { data: isFollowingUser = false } = useQuery({
    queryKey: ["is-following", authUser?.uid, userId],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await isFollowing(authUser.uid, userId);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  // Check if request sent (from subcollection)
  const { data: isRequested = false } = useQuery({
    queryKey: ["has-follow-request", authUser?.uid, userId],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await hasFollowRequest(authUser.uid, userId);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  const isPrivateAccount = targetUserProfile
    ? !targetUserProfile.isPublic
    : false;

  // Follow mutation with optimistic updates
  const followMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      targetUserId,
    }: {
      currentUserId: string;
      targetUserId: string;
    }) => {
      await followUserApi(currentUserId, targetUserId);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [
          "is-following",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });

      // Snapshot previous values
      const previousIsFollowing = queryClient.getQueryData<boolean>([
        "is-following",
        variables.currentUserId,
        variables.targetUserId,
      ]);
      const previousTargetProfile = queryClient.getQueryData([
        "user-profile",
        variables.targetUserId,
      ]);

      // Optimistically update to following state
      queryClient.setQueryData(
        ["is-following", variables.currentUserId, variables.targetUserId],
        true,
      );

      // Optimistically increment follower count
      if (previousTargetProfile) {
        queryClient.setQueryData(["user-profile", variables.targetUserId], {
          ...previousTargetProfile,
          followersCount: (previousTargetProfile as any).followersCount + 1,
        });
      }

      return { previousIsFollowing, previousTargetProfile };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(
          ["is-following", variables.currentUserId, variables.targetUserId],
          context.previousIsFollowing,
        );
      }
      if (context?.previousTargetProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [
          "is-following",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
    },
  });

  // Request mutation with optimistic updates
  const requestMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      targetUserId,
    }: {
      currentUserId: string;
      targetUserId: string;
    }) => {
      await sendFollowRequestApi(currentUserId, targetUserId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [
          "has-follow-request",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });

      const previousIsRequested = queryClient.getQueryData<boolean>([
        "has-follow-request",
        variables.currentUserId,
        variables.targetUserId,
      ]);
      const previousTargetProfile = queryClient.getQueryData([
        "user-profile",
        variables.targetUserId,
      ]);

      // Optimistically update to requested state
      queryClient.setQueryData(
        ["has-follow-request", variables.currentUserId, variables.targetUserId],
        true,
      );

      // Optimistically increment request count
      if (previousTargetProfile) {
        queryClient.setQueryData(["user-profile", variables.targetUserId], {
          ...previousTargetProfile,
          followRequestsReceivedCount:
            (previousTargetProfile as any).followRequestsReceivedCount + 1,
        });
      }

      return { previousIsRequested, previousTargetProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousIsRequested !== undefined) {
        queryClient.setQueryData(
          [
            "has-follow-request",
            variables.currentUserId,
            variables.targetUserId,
          ],
          context.previousIsRequested,
        );
      }
      if (context?.previousTargetProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "has-follow-request",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
    },
  });

  // Cancel request mutation with optimistic updates
  const cancelRequestMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      targetUserId,
    }: {
      currentUserId: string;
      targetUserId: string;
    }) => {
      await cancelFollowRequestApi(currentUserId, targetUserId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [
          "has-follow-request",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });

      const previousIsRequested = queryClient.getQueryData<boolean>([
        "has-follow-request",
        variables.currentUserId,
        variables.targetUserId,
      ]);
      const previousTargetProfile = queryClient.getQueryData([
        "user-profile",
        variables.targetUserId,
      ]);

      // Optimistically update to not-requested state
      queryClient.setQueryData(
        ["has-follow-request", variables.currentUserId, variables.targetUserId],
        false,
      );

      // Optimistically decrement request count
      if (previousTargetProfile) {
        queryClient.setQueryData(["user-profile", variables.targetUserId], {
          ...previousTargetProfile,
          followRequestsReceivedCount: Math.max(
            0,
            (previousTargetProfile as any).followRequestsReceivedCount - 1,
          ),
        });
      }

      return { previousIsRequested, previousTargetProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousIsRequested !== undefined) {
        queryClient.setQueryData(
          [
            "has-follow-request",
            variables.currentUserId,
            variables.targetUserId,
          ],
          context.previousIsRequested,
        );
      }
      if (context?.previousTargetProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "has-follow-request",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
    },
  });

  // Unfollow mutation with optimistic updates
  const unfollowMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      targetUserId,
    }: {
      currentUserId: string;
      targetUserId: string;
    }) => {
      await unfollowUserApi(currentUserId, targetUserId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [
          "is-following",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });

      const previousIsFollowing = queryClient.getQueryData<boolean>([
        "is-following",
        variables.currentUserId,
        variables.targetUserId,
      ]);
      const previousTargetProfile = queryClient.getQueryData([
        "user-profile",
        variables.targetUserId,
      ]);

      // Optimistically update to not-following state
      queryClient.setQueryData(
        ["is-following", variables.currentUserId, variables.targetUserId],
        false,
      );

      // Optimistically decrement follower count
      if (previousTargetProfile) {
        queryClient.setQueryData(["user-profile", variables.targetUserId], {
          ...previousTargetProfile,
          followersCount: Math.max(
            0,
            (previousTargetProfile as any).followersCount - 1,
          ),
        });
      }

      return { previousIsFollowing, previousTargetProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(
          ["is-following", variables.currentUserId, variables.targetUserId],
          context.previousIsFollowing,
        );
      }
      if (context?.previousTargetProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "is-following",
          variables.currentUserId,
          variables.targetUserId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
    },
  });

  const handleFollowAction = () => {
    if (!authUser?.uid || !userId) return;

    if (isFollowingUser) {
      unfollowMutation.mutate({
        currentUserId: authUser.uid,
        targetUserId: userId,
      });
    } else if (isRequested) {
      cancelRequestMutation.mutate({
        currentUserId: authUser.uid,
        targetUserId: userId,
      });
    } else {
      if (isPrivateAccount) {
        requestMutation.mutate({
          currentUserId: authUser.uid,
          targetUserId: userId,
        });
      } else {
        followMutation.mutate({
          currentUserId: authUser.uid,
          targetUserId: userId,
        });
      }
    }
  };

  const isPending =
    followMutation.isPending ||
    unfollowMutation.isPending ||
    requestMutation.isPending ||
    cancelRequestMutation.isPending;

  return {
    isFollowing: isFollowingUser,
    isRequested,
    isPrivateAccount,
    followUser: handleFollowAction,
    unfollowUser: handleFollowAction,
    isPending,
    isError:
      followMutation.isError ||
      unfollowMutation.isError ||
      requestMutation.isError ||
      cancelRequestMutation.isError,
    error:
      followMutation.error ||
      unfollowMutation.error ||
      requestMutation.error ||
      cancelRequestMutation.error,
  };
}
