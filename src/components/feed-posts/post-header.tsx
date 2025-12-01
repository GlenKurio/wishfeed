import { MoreHorizontal } from "lucide-react";
import type { PostType } from "../../lib/types";

export default function PostHeader(post: PostType) {
  // TODO: get post author profile info by createdBy post property;
  // If profile is deleted show skeletons fallabcks and that profile is deleted?
  return (
    <div className="flex w-full items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="avatar">
          <div className="w-8 rounded-full">
            {/* TODO: add fallbacks */}
            <img src={post.userAvatar || ""} alt={post.userName || ""} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5">
            <span className="text-base-content text-xs font-semibold lg:text-sm">
              {post.userName}
            </span>
          </div>
          <span className="text-neutral text-xs">@{post.userHandle}</span>
        </div>
      </div>
      <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
        <MoreHorizontal className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}
