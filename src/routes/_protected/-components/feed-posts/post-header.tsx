import { MoreHorizontal } from "lucide-react";
import type { PostType } from "./post";

export default function PostHeader(post: PostType) {
  return (
    <div className=" w-full flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img src={post.userAvatar} alt={post.userName} />
          </div>
        </div>
        <div className="flex flex-col ">
          <div className="flex items-center gap-0.5">
            <span className="font-semibold text-xs lg:text-sm text-base-content">
              {post.userName}
            </span>
            {post.userVerified && (
              <svg
                className="w-4 h-4 text-info"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <span className="text-xs text-neutral">@{post.userHandle}</span>
        </div>
      </div>
      <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
        <MoreHorizontal className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}
