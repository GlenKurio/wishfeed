import { IconExternalLink } from "@tabler/icons-react";

import { Link } from "@tanstack/react-router";
import type { PostType } from "../../lib/types";
import GiftActionButton from "../gift/gift-action";
import LikeButton from "./btn-like";
import RepostButton from "./btn-repost";

export default function PostFooter(post: PostType) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <LikeButton post={post} />
          <RepostButton post={post} />
        </div>
        <div className="flex items-center gap-2">
          {post.price && (
            <Link
              to={post.wishUrlAffiliate}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs btn-soft lg:btn-sm btn-info hover:bg-info/10 hover:border-info/50 flex items-center gap-1.5 border transition-colors"
            >
              <IconExternalLink className="size-3 lg:size-4" />
              <span className="text-[11px] leading-0 font-medium">
                {/* TODO: improve the display of the price to be mroe readable */}
                ${post.price}
              </span>
            </Link>
          )}
          {/* <GiftButton post={post} />
           */}
          <GiftActionButton post={post} />
        </div>
      </div>
      {/* <p className="text-neutral/60 text-[9px]">
        {formatDate(post.createdAt.toDate(), "yyyy/MM/dd, hh:mm")}
      </p> */}
    </div>
  );
}
