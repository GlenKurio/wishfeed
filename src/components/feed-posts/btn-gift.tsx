import { useAuth } from "@/hooks/use-auth";
import type { PostType } from "@/lib/types";
import { IconCheck, IconGift } from "@tabler/icons-react";

export default function GiftButton({ post }: { post: PostType }) {
  const user = useAuth();
  return (
    <>
      {user?.uid !== post?.author.uid ? (
        <button className="btn btn-primary btn-xs lg:btn-sm flex items-center gap-1.5 transition-colors">
          <IconGift className="size-3 lg:size-4" /> <span>Gift</span>
        </button>
      ) : (
        // TODO: if gifted change color to green and remove text; Improve cta;
        <button className="btn btn-xs lg:btn-sm flex items-center gap-1 transition-colors">
          <IconCheck className="size-3 lg:size-4" /> <span> Gifted</span>
        </button>
      )}
    </>
  );
}
