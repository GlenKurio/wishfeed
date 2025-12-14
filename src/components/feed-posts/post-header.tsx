import { Link } from "@tanstack/react-router";
import type { PostType } from "../../lib/types";
import PostActions from "./post-actions";

export default function PostHeader(post: PostType) {
  // TODO: get post author profile info by createdBy post property;
  // If profile is deleted show skeletons fallabcks and that profile is deleted?
  return (
    <div className="flex w-full items-center justify-between px-2">
      <Link
        to="/profile/$userId/$wishlist"
        params={{ userId: post.author.uid || "", wishlist: "all" }}
      >
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="w-8 rounded-full">
              {/* TODO: add fallbacks */}
              <img
                src={post.author.photoUrl}
                alt={post.author.displayName || ""}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              <span className="text-base-content text-xs font-semibold lg:text-sm">
                {post.author.displayName}
              </span>
            </div>
            <span className="text-neutral text-xs">@{post.author.handle}</span>
          </div>
        </div>
      </Link>
      <PostActions />
    </div>
  );
}
