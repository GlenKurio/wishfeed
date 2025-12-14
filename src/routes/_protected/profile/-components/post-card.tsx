import { Link } from "@tanstack/react-router";
import type { PostType } from "../../../../lib/types";

export default function PostCard({
  post,
  userId,
  wishlist,
}: {
  post: PostType;
  userId: string;
  wishlist: string;
}) {
  return (
    <Link
      key={post.id}
      to="/profile/$userId/$wishlist/feed"
      params={{ userId, wishlist }}
      search={{ postId: post.id }}
      className="group/post bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-4xl transition-all hover:opacity-90"
    >
      <img
        src={post.image || "/placeholder-wish.png"}
        alt={`Post ${post.id}`}
        className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
      />
      <div className="from-primary/40 via-primary/10 pointer-events-none absolute inset-0 z-10 bg-linear-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover/post:opacity-100" />

      <div className="text-base-100 pointer-events-none absolute top-3 left-4 z-20 translate-y-1 pr-3 opacity-0 transition-all duration-300 group-hover/post:translate-y-0 group-hover/post:opacity-100">
        <p className="text-xl leading-tight font-bold">{post.title}</p>

        {post.description && (
          <p className="text-base-300 mt-1 line-clamp-2 text-sm leading-snug">
            {post.description}
          </p>
        )}
      </div>
    </Link>
  );
}
