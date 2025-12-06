import { Link, useParams, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useAuth } from "../../../../hooks/use-auth";
import { IconListDetails } from "@tabler/icons-react";

const wishlists = [
  {
    id: "favorites",
    name: "Favorites",
    count: 3,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop",
  },
  {
    id: "design",
    name: "Design",
    count: 2,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
  },
  {
    id: "drafts",
    name: "Drafts",
    count: 3,
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop",
  },
  {
    id: "tech",
    name: "Tech",
    count: 5,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
  },
  {
    id: "books",
    name: "Books",
    count: 8,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop",
  },
  {
    id: "travel",
    name: "Travel",
    count: 4,
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop",
  },
];

export default function Wishlists({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) {
  const search = useSearch({ from: "/_protected/profile/$userId" });

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 p-2">
        {/* All Tab */}
        <Link
          to="/profile/$userId"
          params={{ userId }}
          search={(prev) => ({ ...prev, wishlist: "all" })}
          className="shrink-0"
        >
          <div
            className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
              search.wishlist === "all" || !search.wishlist
                ? "ring-primary scale-105 shadow-lg ring-2"
                : "hover:scale-105"
            }`}
          >
            <div className="from-primary absolute inset-0 flex items-center justify-center bg-linear-to-br to-rose-300">
              <span className="text-xl font-bold text-white">All</span>
            </div>
          </div>
          <p className="mt-2 text-center text-sm font-medium">All Wishes</p>
        </Link>

        {/* Wishlist Cards */}
        {wishlists.map((w) => (
          <Link
            key={w.id}
            to="/profile/$userId"
            params={{ userId }}
            search={(prev) => ({ ...prev, wishlist: w.id })}
            className="shrink-0"
          >
            <div
              className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
                search.wishlist === w.id
                  ? "ring-primary scale-105 shadow-lg ring-2"
                  : "hover:scale-105"
              }`}
            >
              <img
                src={w.image}
                alt={w.name}
                className="h-full w-full object-cover"
              />
              <div className="from-primary/10 absolute inset-0 bg-linear-to-t to-transparent" />
              <div className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
                {w.count}
              </div>
            </div>
            <p className="mt-2 text-center text-sm font-medium">{w.name}</p>
          </Link>
        ))}

        {/* Create New Wishlist */}
        {/* TODO: place drafts here too, so only the owner of the proifle can see them. Make sure they are not available from editing url; */}
        {isOwner && (
          <>
            <Link
              to="/profile/$userId"
              params={{ userId }}
              search={(prev) => ({ ...prev, wishlist: "drafts" })}
              className="shrink-0"
            >
              <div
                className={`relative size-16 overflow-hidden rounded-3xl transition-all ${
                  search.wishlist === "drafts" || !search.wishlist
                    ? "ring-primary scale-105 shadow-lg ring-2"
                    : "hover:scale-105"
                }`}
              >
                <div className="from-primary absolute inset-0 flex items-center justify-center bg-linear-to-br to-rose-300">
                  <span className="text-xl font-bold text-white">Drafts</span>
                </div>
              </div>
              <p className="mt-2 text-center text-sm font-medium">Drafts</p>
            </Link>
            <Link
              to="/profile/$userId/manage-wishlists"
              params={{ userId: userId }}
              className="shrink-0"
            >
              <div className="group hover:border-primary hover:bg-base-200 flex size-16 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 transition-colors">
                <IconListDetails className="group-hover:text-primary size-8 text-gray-400 transition-colors" />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-gray-600">
                Manage
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
