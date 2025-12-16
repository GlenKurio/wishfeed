import { useAuth } from "@/hooks/use-auth";
import type { GiftModalType, PostType } from "@/lib/types";
import { IconCheck, IconClock, IconGift, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { GiftActionModal } from "./btn-gift-modal";

export default function GiftButton({ post }: { post: PostType }) {
  const user = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<GiftModalType>("reserve");

  const isGifter = user?.uid === post.gifter?.uid;
  const isAuthor = user?.uid === post.author.uid;
  const openModal = (type: GiftModalType) => {
    setModalType(type);
    setIsModalOpen(true);
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
          <>
            <button
              onClick={() => openModal("confirmReceipt")}
              className="btn btn-xs lg:btn-sm btn-success flex items-center gap-1.5"
            >
              <IconCheck className="size-3 lg:size-4" />
              <span>Confirm Receipt</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalType={modalType}
              post={post}
            />
          </>
        );
      case "gifted":
        return (
          <>
            <button
              onClick={() => openModal("revertToSent")}
              className="btn btn-xs lg:btn-sm btn-success flex items-center gap-1.5"
            >
              <IconCheck className="size-3 lg:size-4" />
              <span>Gifted</span>
            </button>

            <GiftActionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              modalType={modalType}
              post={post}
            />
          </>
        );
    }
  }

  // Other users' view
  switch (post.giftStatus) {
    case "available":
      return (
        <>
          <button
            onClick={() => openModal("reserve")}
            className="btn btn-primary btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors hover:scale-105"
          >
            <IconGift className="size-3 lg:size-4" />
            <span>Gift This</span>
          </button>

          <GiftActionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            modalType={modalType}
            post={post}
          />
        </>
      );

    case "reserved":
      return (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => openModal("markAsSent")}
              className="btn btn-success btn-xs lg:btn-sm flex items-center gap-1.5"
            >
              <IconCheck className="size-3 lg:size-4" />
              <span>Mark as Sent</span>
            </button>
            <button
              onClick={() => openModal("cancel")}
              className="btn btn-ghost btn-xs lg:btn-sm"
              title="Cancel reservation"
            >
              <IconX className="size-3 lg:size-4" />
            </button>
          </div>

          <GiftActionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            modalType={modalType}
            post={post}
          />
        </>
      );
    case "sent":
      return (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => openModal("revertToReserved")}
              className="btn btn-success btn-xs lg:btn-sm flex items-center gap-1.5"
            >
              <IconCheck className="size-3 lg:size-4" />
              <span>Gift was sent</span>
            </button>
          </div>

          <GiftActionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            modalType={modalType}
            post={post}
          />
        </>
      );

    case "gifted":
      if (isGifter) {
        return (
          <button className="btn btn-xs lg:btn-sm btn-success flex items-center gap-1.5">
            <IconCheck className="size-3 lg:size-4" />
            <span>Your Gift</span>
          </button>
        );
      }

      return null;
  }
}
