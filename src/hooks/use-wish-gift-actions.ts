import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
  reserveGift,
  markGiftAsSent,
  confirmGiftReceipt,
  cancelGiftReservation,
} from "@/lib/firebase/db";
import type { PostType } from "@/lib/types";
import { toast } from "sonner";
import { useGetUserProfile } from "./use-get-user-profile";
import type { InfiniteData } from "@tanstack/react-query";

// Type for your paginated response
type UserPostsPage = {
  posts: PostType[];
  hasMore: boolean;
  lastDoc: any;
};

export function useWishGiftActions() {
  const authUser = useAuth();
  const queryClient = useQueryClient();
  const { data: user } = useGetUserProfile({
    userProfileId: authUser?.uid,
  });

  // ==========================================
  // Reserve Gift Mutation
  // ==========================================
  const reserveGiftMutation = useMutation({
    mutationFn: ({ postId, post }: { postId: string; post: PostType }) =>
      reserveGift(postId, post),

    onMutate: async ({ postId, post }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", post.author.uid, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      queryClient.setQueryData<InfiniteData<UserPostsPage>>(
        authorQueryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      giftStatus: "reserved" as const,
                      gifter: {
                        uid: user.uid,
                        photoUrl: user.photoURL || undefined,
                        displayName: user.displayName || "Anonymous",
                        handle: user.handle || user.uid,
                      },
                    }
                  : p,
              ),
            })),
          };
        },
      );

      return { previousData, authorQueryKey };
    },

    onError: (error, _, context) => {
      if (context?.previousData && context?.authorQueryKey) {
        queryClient.setQueryData(context.authorQueryKey, context.previousData);
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to reserve gift",
      );
    },

    onSuccess: (_, { post }) => {
      toast.success(
        "🎁 Gift reserved! Don't forget to send it within 30 days.",
      );

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", post.author.uid, "all"],
      });
    },
  });

  // ==========================================
  // Mark Gift as Sent Mutation
  // ==========================================
  const markAsSentMutation = useMutation({
    mutationFn: ({
      giftId,
      postId,
      postAuthorId,
      options,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
      options?: {
        trackingInfo?: string;
        messageToRecipient?: string;
        deliveryMethod?: "shipped" | "digital" | "in-person" | "other";
      };
    }) => markGiftAsSent(giftId, options),

    onMutate: async ({ postId, postAuthorId }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", postAuthorId, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      // Optionally update post status to "gifted" when marked as sent
      // Or keep as "reserved" until confirmed - your choice
      queryClient.setQueryData<InfiniteData<UserPostsPage>>(
        authorQueryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      // Keep as reserved or change to gifted
                      giftStatus: "reserved" as const,
                    }
                  : p,
              ),
            })),
          };
        },
      );

      return { previousData, authorQueryKey };
    },

    onError: (error, { postAuthorId }, context) => {
      if (context?.previousData && context?.authorQueryKey) {
        queryClient.setQueryData(context.authorQueryKey, context.previousData);
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to mark gift as sent",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("📦 Gift marked as sent! Recipient will be notified.");

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", postAuthorId, "all"],
      });
    },
  });

  // ==========================================
  // Confirm Gift Receipt Mutation
  // ==========================================
  const confirmReceiptMutation = useMutation({
    mutationFn: ({
      giftId,
      postId,
      postAuthorId,
      recipientNotes,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
      recipientNotes?: string;
    }) => confirmGiftReceipt(giftId, recipientNotes),

    onMutate: async ({ postId, postAuthorId }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", postAuthorId, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      // Update post to "gifted" status
      queryClient.setQueryData<InfiniteData<UserPostsPage>>(
        authorQueryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      giftStatus: "gifted" as const,
                    }
                  : p,
              ),
            })),
          };
        },
      );

      return { previousData, authorQueryKey };
    },

    onError: (error, { postAuthorId }, context) => {
      if (context?.previousData && context?.authorQueryKey) {
        queryClient.setQueryData(context.authorQueryKey, context.previousData);
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to confirm gift receipt",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("🎉 Gift confirmed! Thank you message sent to gifter.");

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", postAuthorId, "all"],
      });

      // TODO: Invalidate user stats when implemented
      // queryClient.invalidateQueries({
      //   queryKey: ["userStats", authUser?.uid],
      // });
    },
  });

  // ==========================================
  // Cancel Gift Reservation Mutation
  // ==========================================
  const cancelReservationMutation = useMutation({
    mutationFn: ({
      giftId,
      postId,
      postAuthorId,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
    }) => cancelGiftReservation(giftId),

    onMutate: async ({ postId, postAuthorId }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", postAuthorId, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      // Return post to "available" status
      queryClient.setQueryData<InfiniteData<UserPostsPage>>(
        authorQueryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      giftStatus: "available" as const,
                      gifter: undefined,
                    }
                  : p,
              ),
            })),
          };
        },
      );

      return { previousData, authorQueryKey };
    },

    onError: (error, { postAuthorId }, context) => {
      if (context?.previousData && context?.authorQueryKey) {
        queryClient.setQueryData(context.authorQueryKey, context.previousData);
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to cancel reservation",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("Reservation cancelled. Gift is now available again.");

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", postAuthorId, "all"],
      });
    },
  });

  return {
    // Reserve Gift
    reserveGift: reserveGiftMutation.mutate,
    reserveGiftAsync: reserveGiftMutation.mutateAsync,
    isReservingGift: reserveGiftMutation.isPending,

    // Mark as Sent
    markAsSent: markAsSentMutation.mutate,
    markAsSentAsync: markAsSentMutation.mutateAsync,
    isMarkingAsSent: markAsSentMutation.isPending,

    // Confirm Receipt
    confirmReceipt: confirmReceiptMutation.mutate,
    confirmReceiptAsync: confirmReceiptMutation.mutateAsync,
    isConfirmingReceipt: confirmReceiptMutation.isPending,

    // Cancel Reservation
    cancelReservation: cancelReservationMutation.mutate,
    cancelReservationAsync: cancelReservationMutation.mutateAsync,
    isCancellingReservation: cancelReservationMutation.isPending,

    // Combined loading state
    isLoading:
      reserveGiftMutation.isPending ||
      markAsSentMutation.isPending ||
      confirmReceiptMutation.isPending ||
      cancelReservationMutation.isPending,
  };
}
