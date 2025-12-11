import {
  IconBookmarkPlus,
  IconCheck,
  IconExternalLink,
  IconGift,
  IconHeart,
  IconHeartFilled,
} from "@tabler/icons-react";

import { useAuth } from "../../hooks/use-auth";
import { useLikePost } from "../../hooks/use-like-post";
import { Link } from "@tanstack/react-router";
import type { PostType } from "../../lib/types";

export default function PostFooter(post: PostType) {
  const user = useAuth();
  const { handleLikePost, isLiked, likes } = useLikePost(post);
  return (
    <div className="flex items-center justify-between gap-1">
      {/* <p className="text-xs text-neutral/60 ">
            {formatDate(post.createdAt)}
          </p> */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLikePost}
          className="btn btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors"
        >
          {isLiked ? (
            <IconHeartFilled className="text-primary size-4" />
          ) : (
            <IconHeart className="size-4" />
          )}

          <span className="text-[11px] font-medium">{likes}</span>
        </button>

        <button className="btn btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors">
          <IconBookmarkPlus className="size-4" />
          <span className="text-[11px] font-medium">{post.saves.length}</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        {post.price && (
          <Link
            to={post.wishUrlAffiliate}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs btn-dash lg:btn-sm text-info hover:bg-info/10 hover:border-info/50 flex items-center gap-1.5 border transition-colors"
          >
            <IconExternalLink className="size-4" />
            <span className="text-[11px] leading-0 font-medium">
              {post.price}
            </span>
          </Link>
        )}
        {user?.uid !== post?.createdBy ? (
          <button className="btn btn-primary btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors">
            <IconGift className="size-4" /> <span>Gift</span>
          </button>
        ) : (
          // TODO: if gifted change color to green and remove text; Improve cta;
          <button className="btn btn-xs lg:btn-sm flex items-center gap-1 transition-colors">
            <IconCheck className="size-4" /> <span>Mark as Gifted</span>
          </button>
        )}
      </div>
    </div>
  );
}
