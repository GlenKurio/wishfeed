import { IconListDetails } from "@tabler/icons-react";
import { Link, useParams, useRouteContext } from "@tanstack/react-router";

export default function Wishlists() {
  const { isOwner, wishlists } = useRouteContext({
    from: "/_protected/profile/$userId",
  });
  const { userId, wishlist } = useParams({
    from: "/_protected/profile/$userId/$wishlist",
  });

  const wishListsToDisplay = wishlists.filter((w) => w.posts.length >= 0);
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 p-2">
        {/* All Tab */}
        <Link
          to="/profile/$userId/$wishlist"
          params={{ userId, wishlist: "all" }}
          className="shrink-0"
        >
          <div
            className={`bg-base-300 relative flex size-18 items-center justify-center overflow-hidden rounded-3xl transition-all ${
              wishlist === "all" || !wishlist
                ? "ring-primary scale-105 shadow-lg ring-2"
                : "hover:scale-105"
            }`}
          >
            <img
              src="/ampersand.png"
              alt="All wishes list"
              className="size-12"
            />
          </div>
          <p className="mt-2 line-clamp-1 max-w-18 truncate text-center text-[11px] font-medium lg:text-xs">
            All Wishes
          </p>
        </Link>

        {/* Wishlist Cards */}
        {wishListsToDisplay.map((w) => (
          <Link
            key={w.id}
            to="/profile/$userId/$wishlist"
            params={{ userId, wishlist: w.id }}
            className="relative shrink-0"
          >
            <div
              className={`bg-base-300 relative flex size-18 items-center overflow-hidden rounded-3xl transition-all ${
                wishlist === w.id
                  ? "ring-primary scale-105 shadow-lg ring-2"
                  : "hover:scale-105"
              }`}
            >
              {w.cover_image ? (
                <img
                  src={w.cover_image || "/cover-wishlist-mini.png"}
                  alt={w.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <p className="font-family-cursive mt-1 line-clamp-1 w-full truncate ps-1 text-center text-sm leading-5 tracking-wider">
                  {w.title} asdasd asd as da
                </p>
              )}
            </div>
            <p className="mt-2 line-clamp-1 max-w-18 truncate text-center text-[11px] font-medium lg:text-xs">
              {w.title}
            </p>
          </Link>
        ))}

        {isOwner && (
          <>
            <Link
              to="/profile/$userId/$wishlist"
              params={{ userId, wishlist: "drafts" }}
              className="shrink-0"
            >
              <div
                className={`bg-base-300 relative flex size-18 items-center justify-center overflow-hidden rounded-3xl transition-all ${
                  wishlist === "drafts" || !wishlist
                    ? "ring-primary scale-105 shadow-lg ring-2"
                    : "hover:scale-105"
                }`}
              >
                <img
                  src="/drafts.png"
                  alt="All wishes list"
                  className="size-12"
                />
              </div>
              <p className="mt-2 line-clamp-1 max-w-18 truncate text-center text-[11px] font-medium lg:text-xs">
                Drafts
              </p>
            </Link>
            <Link
              to="/profile/$userId/manage-wishlists"
              params={{ userId: userId }}
              className="shrink-0"
            >
              <div className="group hover:border-primary hover:bg-base-200 flex size-18 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 transition-colors">
                <IconListDetails className="group-hover:text-primary size-8 text-gray-400 transition-colors" />
              </div>
              <p className="mt-2 line-clamp-1 max-w-18 truncate text-center text-[11px] font-medium text-gray-600 lg:text-xs">
                Manage
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
