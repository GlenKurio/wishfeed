import type { PostType } from "@/lib/types";
import { IconRepeat } from "@tabler/icons-react";

export default function RepostButton({ post }: { post: PostType }) {
  return (
    <button className="btn btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors">
      <IconRepeat className="size-3 lg:size-4" />
      <span className="text-[11px] font-medium">{post?.repostsCount}</span>
    </button>
  );
}
