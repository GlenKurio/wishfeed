// TODO:

// - When click on brand - open search with brand applied as filter
// - Make like change the fill when active
// - Make all the actions to work
// - Make gift CTA work
// - Show the date
// - Make actions work

import { useState } from "react";
import PostFooter from "./post-footer";
import PostHeader from "./post-header";
import type { PostType } from "../../../../lib/types";

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = post.description && post.description.length > 120;

  return (
    <div className={`flex w-full flex-col gap-2`}>
      {/* Header */}
      <PostHeader {...post} />
      {/* Product Image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-gray-50 to-gray-100">
        <img
          src={post.image || "/product-placeholder.webp"}
          alt={post.title}
          className="h-full w-full object-cover object-center"
        />

        {post.brand && (
          <div className="text-foreground absolute top-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide uppercase shadow-sm backdrop-blur-sm">
            {post.brand}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex flex-col gap-2 px-2">
        <div className="my-1 flex flex-col gap-1 lg:my-2">
          <h3 className="line-clamp-2 text-sm leading-snug font-medium text-pretty lg:text-base">
            {post.title}
          </h3>

          <p
            className={`text-base-content/80 text-xs leading-relaxed text-pretty lg:text-sm ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {post.description}
          </p>

          {hasLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary -mt-0.5 self-start text-xs font-medium hover:underline"
            >
              {isExpanded ? "see less" : "see more"}
            </button>
          )}
        </div>

        {/* Footer */}
        <PostFooter {...post} />
      </div>
    </div>
  );
}
