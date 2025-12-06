import { useAuth } from "@/hooks/use-auth";
import type { Wishlist } from "@/lib/types";
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
  "/_protected/profile/$userId/manage-wishlists/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuth();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Manage Your Wihslists</h2>
        <Link
          to="/profile/$userId/manage-wishlists/create"
          params={{ userId: user.uid }}
          className="btn"
        >
          Create wishlist
        </Link>
      </div>
      {dummyWishlists.length !== 0 ? (
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {dummyWishlists.map((list) => (
            <Link
              key={list.id}
              to="/profile/$userId/manage-wishlists/$listId"
              params={{
                listId: list.id,
                userId: list.owner,
              }}
              className="group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-3xl transition-all hover:opacity-90"
            >
              <img
                src={list.cover_image || "/placeholder.svg"}
                alt={`Post ${list.id}`}
                className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      ) : (
        <>Empty</>
      )}
    </div>
  );
}
