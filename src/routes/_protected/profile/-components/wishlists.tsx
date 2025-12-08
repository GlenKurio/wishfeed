import { userWishlistsQueryOptions } from "@/lib/api";
import { IconListDetails } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export default function Wishlists({
  userId,
  wishlist,
  isOwner,
}: {
  userId: string;
  wishlist: string;
  isOwner: boolean;
}) {
  const { data: wishlists } = useSuspenseQuery(
    userWishlistsQueryOptions({ userId }),
  );
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
            className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
              wishlist === "all" || !wishlist
                ? "ring-primary scale-105 shadow-lg ring-2"
                : "hover:scale-105"
            }`}
          >
            <div className="from-base-300 to-primary/10 absolute inset-0 flex items-center justify-center bg-linear-to-br">
              <img
                src="/ampersand.png"
                alt="All wishes list"
                className="size-12"
              />
            </div>
          </div>
          <p className="mt-2 text-center text-xs font-medium">All Wishes</p>
        </Link>

        {/* Wishlist Cards */}
        {wishListsToDisplay.map((w) => (
          <Link
            key={w.id}
            to="/profile/$userId/$wishlist"
            params={{ userId, wishlist: w.title }}
            className="relative shrink-0"
          >
            <div
              className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
                wishlist === w.title
                  ? "ring-primary scale-105 shadow-lg ring-2"
                  : "hover:scale-105"
              }`}
            >
              {/* TODO: make mini placeholder look good too. */}
              <img
                src={w.cover_image || "/public/placeholder-whishlist.png"}
                alt={w.title}
                className="h-full w-full object-cover"
              />
              <div className="from-primary/10 absolute inset-0 bg-linear-to-t to-transparent" />
            </div>
            <p className="mt-2 text-center text-xs font-medium">{w.title}</p>
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
                className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
                  wishlist === "drafts" || !wishlist
                    ? "ring-primary scale-105 shadow-lg ring-2"
                    : "hover:scale-105"
                }`}
              >
                <div className="from-base-300 to-primary/10 absolute inset-0 flex items-center justify-center bg-linear-to-br">
                  <img
                    src="/drafts.png"
                    alt="All wishes list"
                    className="size-12"
                  />
                </div>
              </div>
              <p className="mt-2 text-center text-xs font-medium">Drafts</p>
            </Link>
            <Link
              to="/profile/$userId/manage-wishlists"
              params={{ userId: userId }}
              className="shrink-0"
            >
              <div className="group hover:border-primary hover:bg-base-200 flex size-16 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 transition-colors">
                <IconListDetails className="group-hover:text-primary size-8 text-gray-400 transition-colors" />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-gray-600">
                Manage
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
