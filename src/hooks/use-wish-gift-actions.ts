import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
  reserveGift,
  markGiftAsSent,
  confirmGiftReceipt,
  cancelGiftReservation,
  revertGiftToReserved,
  revertGiftToSent,
} from "@/lib/firebase/firestore/gifts";
import type { DeliveryMethod, PostType } from "@/lib/types";
import { toast } from "sonner";
import { useGetUserProfile } from "./use-get-user-profile";
import type { InfiniteData } from "@tanstack/react-query";
import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

// Type for your paginated response
type UserPostsPage = {
  posts: PostType[];
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData> | undefined;
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
    mutationFn: ({
      postId,
      post,
      deliveryMethod,
    }: {
      postId: string;
      post: PostType;
      deliveryMethod: DeliveryMethod;
    }) =>
      reserveGift(postId, post, {
        deliveryMethod,
      }),

    onMutate: async ({ postId, post, deliveryMethod }) => {
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
                      gift: {
                        giftStatus: "reserved",
                        deliveryMethod: deliveryMethod,
                        expiresAt: Timestamp.fromDate(
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        ),
                        gifter: {
                          uid: user.uid,
                          photoUrl: user.photoURL || undefined,
                          displayName: user.displayName || "Anonymous",
                          handle: user.handle || user.uid,
                        },
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
      options,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
      options?: {
        trackingInfo: string;
        messageToRecipient: string;
        deliveryMethod: DeliveryMethod;
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
                      giftStatus: "sent" as const,
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

    onError: (error, _, context) => {
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
                      gift: {
                        expiresAt: null,
                        giftStatus: "available" as const,
                        deliveryMethod: "ship_label",
                        gifter: undefined,
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
        error instanceof Error ? error.message : "Failed to cancel reservation",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("Reservation cancelled.");

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", postAuthorId, "all"],
      });
    },
  });

  // ==========================================
  // Revert Gift to Reserved (undo "sent")
  // ==========================================
  const revertToReservedMutation = useMutation({
    mutationFn: ({
      giftId,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
    }) => revertGiftToReserved(giftId),

    onMutate: async ({ postId, postAuthorId }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", postAuthorId, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      // Keep post as reserved
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
        error instanceof Error ? error.message : "Failed to undo sent status",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("Gift status set to reserved");

      queryClient.invalidateQueries({
        queryKey: ["posts", "user", postAuthorId, "all"],
      });
    },
  });

  // ==========================================
  // Revert Gift to Sent (undo confirmation)
  // ==========================================
  const revertToSentMutation = useMutation({
    mutationFn: ({
      giftId,
    }: {
      giftId: string;
      postId: string;
      postAuthorId: string;
    }) => revertGiftToSent(giftId),

    onMutate: async ({ postId, postAuthorId }) => {
      if (!user || !authUser) return;

      const authorQueryKey = ["posts", "user", postAuthorId, "all"] as const;

      await queryClient.cancelQueries({ queryKey: authorQueryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<UserPostsPage>>(authorQueryKey);

      // Revert post to reserved
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
        error instanceof Error ? error.message : "Failed to undo confirmation",
      );
    },

    onSuccess: (_, { postAuthorId }) => {
      toast.success("Gift marked as not recieved yet");

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

    // Revert actions
    revertToReserved: revertToReservedMutation.mutate,
    revertToReservedAsync: revertToReservedMutation.mutateAsync,
    isRevertingToReserved: revertToReservedMutation.isPending,

    revertToSent: revertToSentMutation.mutate,
    revertToSentAsync: revertToSentMutation.mutateAsync,
    isRevertingToSent: revertToSentMutation.isPending,

    // Combined loading state
    // Combined loading state
    isLoading:
      reserveGiftMutation.isPending ||
      markAsSentMutation.isPending ||
      confirmReceiptMutation.isPending ||
      cancelReservationMutation.isPending ||
      revertToReservedMutation.isPending ||
      revertToSentMutation.isPending,
  };
}
