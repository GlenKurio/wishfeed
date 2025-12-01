import type { PostType } from "../../../../lib/types";

export default function PostCard({ post }: { post: PostType }) {
  return (
    <div>
      PostCard
      {post.title}
      <p>{post.isPublished}</p>
    </div>
  );
}
