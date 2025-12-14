import EmptyFrame from "@/components/empty-frame";
import { Icons } from "@/components/icons";
import PageHeading from "@/components/page-heading";
import { useAuth } from "@/hooks/use-auth";
import { userWishlistsQueryOptions } from "@/lib/api";
import { IconArrowLeft } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/profile/$userId/manage-wishlists/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuth();

  const { data: wishlists } = useSuspenseQuery(
    userWishlistsQueryOptions({ userId: user.uid }),
  );
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to={"/profile/$userId/$wishlist"}
            params={{
              userId: user.uid,
              wishlist: "all",
            }}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <PageHeading title="Manage Your Wihslists" />
        </div>
        <h2 className="text-base-content text-3xl font-bold"></h2>
        <Link
          to="/profile/$userId/manage-wishlists/$listId"
          params={{ userId: user.uid, listId: "new" }}
          className="btn btn-md tracking-wide"
        >
          New wishlist
          <Icons.wishlist className="size-4" />
        </Link>
      </div>
      {wishlists.length !== 0 ? (
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {wishlists.map((list) => (
            <Link
              key={list.id}
              to="/profile/$userId/manage-wishlists/$listId"
              params={{
                listId: list.id,
                userId: list.owner,
              }}
              className="group/list bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-4xl"
            >
              {/* Image (base layer) */}
              <img
                src={list.cover_image || "/placeholder-wishlist.png"}
                alt={`List ${list.id}`}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/list:scale-105"
              />

              {/* Gradient overlay (smooth fade in) */}
              <div className="from-primary/40 via-primary/10 pointer-events-none absolute inset-0 z-10 bg-linear-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover/list:opacity-100" />
              {/* Title (smooth fade + slide up) */}
              <div className="text-base-100 pointer-events-none absolute top-3 left-3 z-20 translate-y-1 pr-3 opacity-0 transition-all duration-300 group-hover/list:translate-y-0 group-hover/list:opacity-100">
                <p className="text-xl leading-tight font-bold">
                  {list.title} ({list.posts.length})
                </p>

                {list.description && (
                  <p className="text-base-300 mt-1 line-clamp-2 text-sm leading-snug">
                    {list.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyFrame text={"It's time to create your first wishlist!"} />
      )}
    </div>
  );
}
