import { Link, useParams, useSearch } from "@tanstack/react-router";
import { useAuth } from "../../../../hooks/use-auth";

const wishlists = [
  { id: "all", name: "All", count: 12 },
  { id: "favorites", name: "Favorites", count: 3 },
  { id: "design", name: "Design", count: 2 },
  { id: "drafts", name: "Drafts", count: 3 },
];
export default function Wishlists({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) {
  const search = useSearch({ from: "/_protected/profile/$userId" }); // change route to your actual

  return (
    <div role="tablist" className="tabs">
      {wishlists.map((w) => (
        <Link
          key={w.id}
          role="tab"
          className={`tab ${search.wishlist === w.id ? "tab-active" : ""}`}
          to="/profile/$userId"
          params={{ userId }}
          search={(prev) => ({ ...prev, wishlist: w.id })}
        >
          {w.name}
        </Link>
      ))}
    </div>
  );
}
