import PostFooter from "./post-footer";
import PostHeader from "./post-header";

export type PostType = {
  id: string;
  image: string;
  title: string;
  brand: string;
  description: string;
  price: string;
  likes: string[];
  saves: string[];
  gifted: boolean;
  userUid: string;
  userName: string;
  userVerified: boolean;
  userAvatar: string;
  userHandle: string;
  createdAt: Date;
  updatedAt: Date;
};

interface PostProps {
  post: PostType;
}

// TODO:
// - Add 'see more' to unwind the full description;
// - Add price range
// - Add brand
// - Add link to the product - should it be title?
// - When click on brand - open search with brand applied as filter
// - Make like change the fill when active
// - Make all the actions to work
// - Make gift CTA work
// - Add the link as CTA 'see the product or get the product'
// - Show the date
// - Make actions work
export function Post({ post }: PostProps) {
  return (
    <div className={`w-full flex flex-col gap-2`}>
      {/* Header */}
      <PostHeader {...post} />
      {/* Product Image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-gray-50 to-gray-100 shadow-md">
        <img
          src={post.image || "/product-placeholder.webp"}
          alt={post.title}
          className="h-full w-full object-cover"
        />

        {/* <p className="badge badge-sm badge-accent absolute top-2 left-2  text-[12px] font-medium uppercase tracking-wide text-neutral">
          {post.brand}
        </p> */}
      </div>
      {/* Content */}
      <div className="flex flex-col gap-4 px-2">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-pretty text-sm lg:text-base font-medium leading-snug ">
            {post.title}
          </h3>

          <p className="text-xs lg:text-sm line-clamp-2 text-pretty leading-relaxed text-base-content/70">
            {post.description}
          </p>
        </div>

        {/* Footer */}
        <PostFooter {...post} />
      </div>
    </div>
  );
}
