import {
  IconGift,
  IconHeart,
  IconMessageCircle,
  IconRepeat,
} from "@tabler/icons-react";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "../../../hooks/use-auth";

export type WishPostType = {
  image: string;
  title: string;
  brand: string;
  description: string;
  price: string;
  comments: number;
  likes: number;
  userName: string;
  userVerified: boolean;
  userAvatar: string;
  userHandle: string;
  createdAt: Date;
};

interface WishPostProps {
  post: WishPostType;
  className?: string;
}

// TODO:
// - Add 'see more' to unwind the full description;
// - Add price range
// - Add link to the product - should it be title?
// - When click on brand - open search with brand applied as filter
// - Make like change the fill when active
// - Make all the actions to work
// - Make gift CTA work
export function WishPost({ post, className = "" }: WishPostProps) {
  const currentUser = useAuth();
  console.log("Current user: ", currentUser);
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className={` relative w-full flex flex-col gap-3 lg:gap-6 overflow-hidden rounded-3xl bg-white p-4 lg:p-6 shadow-sm transition-all hover:scale-102 hover:shadow-xl ${className} duration-300`}
    >
      {/* Header */}
      <div className=" flex items-center justify-between">
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
            <span className="text-xs text-neutral/70">@{post.userHandle}</span>
          </div>
        </div>
        <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-gray-50 to-gray-100">
        <img
          src={post.image || "/product-placeholder.webp"}
          alt={post.title}
          className="h-full w-full object-cover"
        />

        <p className="badge badge-sm badge-accent absolute top-2 left-2  text-[12px] font-medium uppercase tracking-wide text-neutral">
          {post.brand}
        </p>
      </div>
      {/* Content */}
      <div className="">
        <h3 className="mb-2 line-clamp-2 text-pretty text-sm lg:text-base font-medium leading-snug ">
          {post.title}
        </h3>

        <p className="text-xs lg:text-sm line-clamp-2 text-pretty leading-relaxed text-base-content/70">
          {post.description}
        </p>
      </div>
      {currentUser?.email !== post?.userEmail && (
        <button className="btn btn-primary  btn-sm lg:btn-md">
          <IconGift className="mr-2 h-5 w-5" />
          Gift to {post.userName}
        </button>
      )}

      {/* Footer */}
      <div className="flex justify-between items-end gap-1 mt-2 lg:mt-4">
        <p className="text-xs text-neutral/60 ">{formatDate(post.createdAt)}</p>
        <div className="flex items-center gap-2">
          <button className="btn btn-xs lg:btn-sm transition-colors flex items-center gap-1">
            <IconMessageCircle className="size-4" />
            <span className="text-[11px] font-medium">{post.comments}</span>
          </button>
          <button className="btn btn-xs lg:btn-sm transition-colors flex items-center gap-1.5">
            <IconRepeat className="size-4" />
            <span className="text-[11px] font-medium">{post.likes}</span>
          </button>
          <button className="btn btn-xs lg:btn-sm transition-colors flex items-center gap-1.5">
            <IconHeart className="size-4" />
            <span className="text-[11px] font-medium">{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
