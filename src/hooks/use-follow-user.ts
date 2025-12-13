import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useGetUserProfile } from "./use-get-user-profile";
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
  sendFollowRequest as sendFollowRequestApi,
  cancelFollowRequest as cancelFollowRequestApi,
  acceptFollowRequest as acceptFollowRequestApi,
  rejectFollowRequest as rejectFollowRequestApi,
  isFollowing,
  hasFollowRequest,
  hasIncomingFollowRequest,
} from "@/lib/firebase/db";
import { useQuery } from "@tanstack/react-query";

export function useFollowUser({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const authUser = useAuth();
  const { data: targetUserProfile } = useGetUserProfile({
    userProfileId: userId,
  });

  // Check if target user is following current user
  const { data: targetFollowsMe = false } = useQuery({
    queryKey: ["is-following", userId, authUser?.uid],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await isFollowing(userId, authUser.uid);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  // Check if current user is following target user
  const { data: isFollowingUser = false } = useQuery({
    queryKey: ["is-following", authUser?.uid, userId],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await isFollowing(authUser.uid, userId);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  // Check if current user sent request to target user
  const { data: isRequested = false } = useQuery({
    queryKey: ["has-follow-request", authUser?.uid, userId],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await hasFollowRequest(authUser.uid, userId);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  // Check if target user sent request to current user
  const { data: hasIncomingRequest = false } = useQuery({
    queryKey: ["has-incoming-request", authUser?.uid, userId],
    queryFn: async () => {
      if (!authUser?.uid || !userId) return false;
      return await hasIncomingFollowRequest(authUser.uid, userId);
    },
    enabled: !!authUser?.uid && !!userId,
  });

  const isPrivateAccount = targetUserProfile
    ? !targetUserProfile.isPublic
    : false;

  // Should show "Follow Back" - they follow you, but you don't follow them
  const shouldShowFollowBack = targetFollowsMe && !isFollowingUser;

  // Follow mutation (bypasses privacy if they follow you)
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

      queryClient.setQueryData(
        ["is-following", variables.currentUserId, variables.targetUserId],
        true,
      );

      if (previousTargetProfile) {
        queryClient.setQueryData(["user-profile", variables.targetUserId], {
          ...previousTargetProfile,
          followersCount: (previousTargetProfile as any).followersCount + 1,
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

  // Request mutation
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

      queryClient.setQueryData(
        ["has-follow-request", variables.currentUserId, variables.targetUserId],
        true,
      );

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

  // Cancel request mutation
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

      queryClient.setQueryData(
        ["has-follow-request", variables.currentUserId, variables.targetUserId],
        false,
      );

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

  // Accept follow request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      requesterId,
    }: {
      currentUserId: string;
      requesterId: string;
    }) => {
      await acceptFollowRequestApi(currentUserId, requesterId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: [
          "is-following",
          variables.requesterId,
          variables.currentUserId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });

      const previousHasIncoming = queryClient.getQueryData<boolean>([
        "has-incoming-request",
        variables.currentUserId,
        variables.requesterId,
      ]);
      const previousProfile = queryClient.getQueryData([
        "user-profile",
        variables.currentUserId,
      ]);

      queryClient.setQueryData(
        [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
        false,
      );
      queryClient.setQueryData(
        ["is-following", variables.requesterId, variables.currentUserId],
        true,
      );

      if (previousProfile) {
        queryClient.setQueryData(["user-profile", variables.currentUserId], {
          ...previousProfile,
          followRequestsReceivedCount: Math.max(
            0,
            (previousProfile as any).followRequestsReceivedCount - 1,
          ),
          followersCount: (previousProfile as any).followersCount + 1,
        });
      }

      return { previousHasIncoming, previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousHasIncoming !== undefined) {
        queryClient.setQueryData(
          [
            "has-incoming-request",
            variables.currentUserId,
            variables.requesterId,
          ],
          context.previousHasIncoming,
        );
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.currentUserId],
          context.previousProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "is-following",
          variables.requesterId,
          variables.currentUserId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.requesterId],
      });
    },
  });

  // Reject follow request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({
      currentUserId,
      requesterId,
    }: {
      currentUserId: string;
      requesterId: string;
    }) => {
      await rejectFollowRequestApi(currentUserId, requesterId);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });

      const previousHasIncoming = queryClient.getQueryData<boolean>([
        "has-incoming-request",
        variables.currentUserId,
        variables.requesterId,
      ]);
      const previousProfile = queryClient.getQueryData([
        "user-profile",
        variables.currentUserId,
      ]);

      queryClient.setQueryData(
        [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
        false,
      );

      if (previousProfile) {
        queryClient.setQueryData(["user-profile", variables.currentUserId], {
          ...previousProfile,
          followRequestsReceivedCount: Math.max(
            0,
            (previousProfile as any).followRequestsReceivedCount - 1,
          ),
        });
      }

      return { previousHasIncoming, previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousHasIncoming !== undefined) {
        queryClient.setQueryData(
          [
            "has-incoming-request",
            variables.currentUserId,
            variables.requesterId,
          ],
          context.previousHasIncoming,
        );
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ["user-profile", variables.currentUserId],
          context.previousProfile,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "has-incoming-request",
          variables.currentUserId,
          variables.requesterId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.currentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.requesterId],
      });
    },
  });

  // Unfollow mutation
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

      queryClient.setQueryData(
        ["is-following", variables.currentUserId, variables.targetUserId],
        false,
      );

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

  // Main action handler
  const handleFollowAction = () => {
    if (!authUser?.uid || !userId) return;

    // Already following - unfollow
    if (isFollowingUser) {
      unfollowMutation.mutate({
        currentUserId: authUser.uid,
        targetUserId: userId,
      });
    }
    // Request already sent - cancel it
    else if (isRequested) {
      cancelRequestMutation.mutate({
        currentUserId: authUser.uid,
        targetUserId: userId,
      });
    }
    // They follow you - follow back (bypasses privacy check)
    else if (shouldShowFollowBack) {
      followMutation.mutate({
        currentUserId: authUser.uid,
        targetUserId: userId,
      });
    }
    // Default - follow or request based on privacy
    else {
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

  const handleAcceptRequest = () => {
    if (!authUser?.uid || !userId) return;
    acceptRequestMutation.mutate({
      currentUserId: authUser.uid,
      requesterId: userId,
    });
  };

  const handleRejectRequest = () => {
    if (!authUser?.uid || !userId) return;
    rejectRequestMutation.mutate({
      currentUserId: authUser.uid,
      requesterId: userId,
    });
  };

  const isPending =
    followMutation.isPending ||
    unfollowMutation.isPending ||
    requestMutation.isPending ||
    cancelRequestMutation.isPending ||
    acceptRequestMutation.isPending ||
    rejectRequestMutation.isPending;

  return {
    isFollowing: isFollowingUser,
    isRequested,
    hasIncomingRequest,
    shouldShowFollowBack,
    targetFollowsMe,
    isPrivateAccount,
    followUser: handleFollowAction,
    unfollowUser: handleFollowAction,
    acceptRequest: handleAcceptRequest,
    rejectRequest: handleRejectRequest,
    isPending,
    isError:
      followMutation.isError ||
      unfollowMutation.isError ||
      requestMutation.isError ||
      cancelRequestMutation.isError ||
      acceptRequestMutation.isError ||
      rejectRequestMutation.isError,
    error:
      followMutation.error ||
      unfollowMutation.error ||
      requestMutation.error ||
      cancelRequestMutation.error ||
      acceptRequestMutation.error ||
      rejectRequestMutation.error,
  };
}
