import EmptyFrame from "@/components/empty-frame";
import { Icons } from "@/components/icons";
import PageHeading from "@/components/page-heading";
import { useAuth } from "@/hooks/use-auth";
import { userWishlistsQueryOptions } from "@/lib/api";
import type { Wishlist } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Timestamp } from "firebase/firestore";

export const dummyWishlists: Wishlist[] = [
  {
    id: "wishlist_2",
    cover_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03",
    title: "My Reading List",
    description: "Books I want to read this year.",
    posts: ["post_201", "post_202"],
    owner: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "wishlist_3",
    cover_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Gadgets & Tech",
    description: "Cool gadgets, electronics, and tech accessories I’m eyeing.",
    posts: ["post_301", "post_302", "post_303", "post_304"],
    owner: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "wishlist_4",
    cover_image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24",
    title: "Dream Wardrobe",
    description: "Clothes and outfits I want to buy eventually.",
    posts: ["post_401"],
    owner: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "wishlist_5",
    cover_image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1",
    title: "Home & Interior",
    description: "Furniture and decor ideas for my future home.",
    posts: ["post_501", "post_502", "post_503"],
    owner: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export const Route = createFileRoute(
  "/_protected/profile/$user/manage-wishlists/",
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
        <PageHeading title="Manage Your Wihslists" />
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
                src={list.cover_image || "/placeholder.svg"}
                alt={`Post ${list.id}`}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/list:scale-105"
              />

              {/* Gradient overlay (smooth fade in) */}
              <div className="from-primary/40 via-primary/10 pointer-events-none absolute inset-0 z-10 bg-linear-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover/list:opacity-100" />

              {/* Title (smooth fade + slide up) */}
              <p className="text-base-100 pointer-events-none absolute top-3 left-3 z-20 translate-y-1 font-bold opacity-0 transition-all duration-300 group-hover/list:translate-y-0 group-hover/list:opacity-100">
                {list.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyFrame text={"It's time to create your first wishlist!"} />
      )}
    </div>
  );
}
