import {
  IconBookmarkPlus,
  IconCheck,
  IconExternalLink,
  IconGift,
  IconHeart,
  IconHeartFilled,
} from "@tabler/icons-react";
import type { PostType } from "./post";
import { useAuth } from "../../../../hooks/use-auth";
import { useLikePost } from "../../../../hooks/use-like-post";
import { Link } from "@tanstack/react-router";

export default function PostFooter(post: PostType) {
  const user = useAuth();
  const { handleLikePost, isLiked, likes } = useLikePost(post);
  return (
    <div className="flex justify-between items-center gap-1 ">
      {/* <p className="text-xs text-neutral/60 ">
            {formatDate(post.createdAt)}
          </p> */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLikePost}
          className="btn btn-xs lg:btn-sm transition-colors flex items-center gap-1.5"
        >
          {isLiked ? (
            <IconHeartFilled className="size-4 text-primary" />
          ) : (
            <IconHeart className="size-4" />
          )}

          <span className="text-[11px] font-medium">{likes}</span>
        </button>

        <button className="btn btn-xs lg:btn-sm transition-colors flex items-center gap-1.5">
          <IconBookmarkPlus className="size-4" />
          <span className="text-[11px] font-medium">{post.saves.length}</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        {post.price && (
          <Link
            to={post.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs btn-dash border lg:btn-sm transition-colors flex items-center gap-1.5 text-info hover:bg-info/10 hover:border-info/50"
          >
            <IconExternalLink className="size-4" />
            <span className="text-[11px] font-medium leading-0">
              {post.price}
            </span>
          </Link>
        )}
        {user?.uid !== post?.userUid ? (
          <button className="btn btn-primary btn-xs lg:btn-sm transition-colors flex items-center gap-1.5">
            <IconGift className="size-4" /> <span>Gift</span>
          </button>
        ) : (
          // TODO: if gifted change color to green and remove text; Improve cta;
          <button className="btn  btn-xs lg:btn-sm transition-colors flex items-center gap-1">
            <IconCheck className="size-4" /> <span>Mark as Gifted</span>
          </button>
        )}
      </div>
    </div>
  );
}
