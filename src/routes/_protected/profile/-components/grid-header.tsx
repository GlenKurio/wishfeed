import { useAuth } from "@/hooks/use-auth";
import { profileQueryOptions } from "@/lib/api";
import type { Wishlist } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";

type GridHeaderProps = {
  wishlist: string;
  currentWishlist?: Wishlist;
  userId: string;
};

export function GridHeader({
  wishlist,
  currentWishlist,
  userId,
}: GridHeaderProps) {
  const user = useAuth();
  // Hardcoded defaults for special pages
  const presetTitles: Record<string, string> = {
    all: "All Wishes",
    drafts: "Draft Wishes",
  };
  const { data: userProfile } = useSuspenseQuery(profileQueryOptions(userId));

  const isOwner = user.uid === userId;
  const presetDescriptions: Record<string, string> = {
    all: isOwner
      ? "Everything You've ever wished for"
      : `Everything ${userProfile?.displayName} ever wished for`,
    drafts: "Your saved drafts — unfinished wishes waiting to be shared",
  };
  const title = presetTitles[wishlist] ?? currentWishlist?.title ?? "";

  const description =
    presetDescriptions[wishlist] ?? currentWishlist?.description ?? "";

  return (
    <div className="border-primary/50 bg-base-200/50 mb-6 flex flex-col rounded-3xl border-2 border-dashed px-5 pt-2 pb-4 lg:mb-8">
      {/* Title */}
      <h3
        className="font-family-cursive text-primary/50 truncate text-4xl leading-11 md:text-5xl lg:text-6xl lg:leading-20"
        title={title}
      >
        {title}
      </h3>

      <p className="font-family-cursive text-base-content/75 text-xl leading-7 tracking-wider md:text-2xl lg:-mt-3 lg:text-3xl lg:leading-11">
        {description}
      </p>
    </div>
  );
}
