import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useGetUserProfile } from "./use-get-user-profile";
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
} from "@/lib/firebase/db";
import type { UserProfile } from "@/lib/types";

export function useFollowUser({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();
  const authUser = useAuth();
  const { data: authUserProfile } = useGetUserProfile({
    userProfileId: authUser?.uid,
  });

  const isFollowing =
    authUserProfile?.following.includes(userId || "") ?? false;

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
    onMutate: async ({ currentUserId, targetUserId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["user-profile", currentUserId],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", targetUserId],
      });

      // Snapshot previous values
      const previousCurrentUser = queryClient.getQueryData<UserProfile>([
        "user-profile",
        currentUserId,
      ]);
      const previousTargetUser = queryClient.getQueryData<UserProfile>([
        "user-profile",
        targetUserId,
      ]);

      // Optimistically update
      if (previousCurrentUser) {
        queryClient.setQueryData<UserProfile>(["user-profile", currentUserId], {
          ...previousCurrentUser,
          following: [...previousCurrentUser.following, targetUserId],
        });
      }

      if (previousTargetUser) {
        queryClient.setQueryData<UserProfile>(["user-profile", targetUserId], {
          ...previousTargetUser,
          followers: [...previousTargetUser.followers, currentUserId],
        });
      }

      return { previousCurrentUser, previousTargetUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(
          ["user-profile", variables.currentUserId],
          context.previousCurrentUser,
        );
      }
      if (context?.previousTargetUser) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetUser,
        );
      }
    },
    onSettled: async (data, error, variables) => {
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
    },
  });

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
    onMutate: async ({ currentUserId, targetUserId }) => {
      await queryClient.cancelQueries({
        queryKey: ["user-profile", currentUserId],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", targetUserId],
      });

      const previousCurrentUser = queryClient.getQueryData<UserProfile>([
        "user-profile",
        currentUserId,
      ]);
      const previousTargetUser = queryClient.getQueryData<UserProfile>([
        "user-profile",
        targetUserId,
      ]);

      if (previousCurrentUser) {
        queryClient.setQueryData<UserProfile>(["user-profile", currentUserId], {
          ...previousCurrentUser,
          following: previousCurrentUser.following.filter(
            (id) => id !== targetUserId,
          ),
        });
      }

      if (previousTargetUser) {
        queryClient.setQueryData<UserProfile>(["user-profile", targetUserId], {
          ...previousTargetUser,
          followers: previousTargetUser.followers.filter(
            (id) => id !== currentUserId,
          ),
        });
      }

      return { previousCurrentUser, previousTargetUser };
    },
    onError: (err, variables, context) => {
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(
          ["user-profile", variables.currentUserId],
          context.previousCurrentUser,
        );
      }
      if (context?.previousTargetUser) {
        queryClient.setQueryData(
          ["user-profile", variables.targetUserId],
          context.previousTargetUser,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.targetUserId],
      });
    },
  });

  const followUser = () => {
    if (!authUser?.uid || !userId) return;

    followMutation.mutate({
      currentUserId: authUser.uid,
      targetUserId: userId,
    });
  };

  const unfollowUser = () => {
    if (!authUser?.uid || !userId) return;

    unfollowMutation.mutate({
      currentUserId: authUser.uid,
      targetUserId: userId,
    });
  };

  return {
    isFollowing,
    followUser,
    unfollowUser,
    isPending: followMutation.isPending || unfollowMutation.isPending,
    isError: followMutation.isError || unfollowMutation.isError,
    error: followMutation.error || unfollowMutation.error,
  };
}
