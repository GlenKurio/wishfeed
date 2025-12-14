import { useLikePost } from "@/hooks/use-like-post";
import type { PostType } from "@/lib/types";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

export default function LikeButton({ post }: { post: PostType }) {
  const { isLiked, handleLikePost, likes } = useLikePost(post);
  return (
    <button
      onClick={handleLikePost}
      className="btn btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors"
    >
      {isLiked ? (
        <IconHeartFilled className="text-primary size-3 lg:size-4" />
      ) : (
        <IconHeart className="size-3 lg:size-4" />
      )}

      <span className="text-[11px] font-medium">{likes}</span>
    </button>
  );
}
