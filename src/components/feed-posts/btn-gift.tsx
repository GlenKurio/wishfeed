import { useAuth } from "@/hooks/use-auth";
import { useWishGiftActions } from "@/hooks/use-wish-gift-actions";
import type { PostType } from "@/lib/types";
import { IconCheck, IconGift, IconClock, IconX } from "@tabler/icons-react";

export default function GiftButton({ post }: { post: PostType }) {
  const user = useAuth();
  const {
    reserveGift,
    markAsSent,
    confirmReceipt,
    cancelReservation,
    isLoading,
  } = useWishGiftActions();

  const isGifter = user?.uid === post.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;

  const handleReserveGift = () => {
    if (!user || !post.id) return;
    reserveGift({ postId: post.id, post });
  };

  const handleMarkAsSent = () => {
    if (!post.id || !user?.uid) return;

    const giftId = `${post.id}_${user.uid}`;

    markAsSent({
      giftId,
      postId: post.id,
      postAuthorId: post.author.uid,
      options: {
        deliveryMethod: "shipped",
        // TODO: Add modal to collect tracking info and message
      },
    });
  };

  const handleConfirmReceipt = () => {
    if (!post.id || !post.gifter?.uid) return;

    const giftId = `${post.id}_${post.gifter.uid}`;

    confirmReceipt({
      giftId,
      postId: post.id,
      postAuthorId: post.author.uid,
      // TODO: Add modal to collect thank you message
    });
  };

  const handleCancelReservation = () => {
    if (!post.id || !user?.uid) return;

    if (!confirm("Are you sure you want to cancel this gift reservation?")) {
      return;
    }

    const giftId = `${post.id}_${user.uid}`;

    cancelReservation({
      giftId,
      postId: post.id,
      postAuthorId: post.author.uid,
    });
  };

  // Author's view
  if (isAuthor) {
    switch (post.giftStatus) {
      case "available":
        return (
          <div className="btn btn-xs lg:btn-sm btn-ghost flex cursor-default items-center gap-1.5">
            <IconGift className="size-3 opacity-50 lg:size-4" />
            <span className="opacity-50">Available</span>
          </div>
        );

      case "reserved":
        return (
          <button
            className="btn btn-xs lg:btn-sm btn-warning btn-soft flex items-center gap-1.5"
            disabled
          >
            <IconClock className="size-3 lg:size-4" />
            <span>🎁 Surprise incoming!</span>
          </button>
        );

      case "sent":
        return (
          <button
            onClick={handleConfirmReceipt}
            disabled={isLoading}
            className="btn btn-xs lg:btn-sm btn-success flex items-center gap-1.5"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <IconCheck className="size-3 lg:size-4" />
            )}
            <span>Confirm Receipt</span>
          </button>
        );
    }
  }

  // Other users' view
  switch (post.giftStatus) {
    case "available":
      return (
        <button
          onClick={handleReserveGift}
          disabled={isLoading}
          className="btn btn-primary btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors hover:scale-105"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              <span>Reserving...</span>
            </>
          ) : (
            <>
              <IconGift className="size-3 lg:size-4" />
              <span>Gift This</span>
            </>
          )}
        </button>
      );

    case "reserved":
      if (isGifter) {
        return (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAsSent}
              disabled={isLoading}
              className="btn btn-success btn-xs lg:btn-sm flex items-center gap-1.5"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <IconCheck className="size-3 lg:size-4" />
              )}
              <span>Mark as Sent</span>
            </button>
            <button
              onClick={handleCancelReservation}
              disabled={isLoading}
              className="btn btn-ghost btn-xs lg:btn-sm"
              title="Cancel reservation"
            >
              <IconX className="size-3 lg:size-4" />
            </button>
          </div>
        );
      }

      return (
        <button
          className="btn btn-xs lg:btn-sm btn-ghost flex cursor-default items-center gap-1.5"
          disabled
        >
          <IconClock className="size-3 lg:size-4" />
          <span>Reserved</span>
        </button>
      );

    case "gifted":
      if (isGifter) {
        return (
          <button
            className="btn btn-xs lg:btn-sm btn-success btn-soft flex items-center gap-1.5"
            disabled
          >
            <IconCheck className="size-3 lg:size-4" />
            <span>Your Gift ✓</span>
          </button>
        );
      }

      return (
        <button
          className="btn btn-xs lg:btn-sm btn-ghost flex cursor-default items-center gap-1.5"
          disabled
        >
          <IconCheck className="text-success size-3 lg:size-4" />
          <span className="text-success">Gifted</span>
        </button>
      );

    default:
      return null;
  }
}
