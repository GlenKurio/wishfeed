import type { FollowerFollowingInfo } from "@/lib/types";
import { IconPhoto } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function UserCard({ user }: { user: FollowerFollowingInfo }) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = user.photoURL && user.photoURL !== "" && !imageError;

  return (
    <Link
      to="/profile/$userId/$wishlist"
      params={{ userId: user.uid, wishlist: "all" }}
      className="border-primary/20 bg-base-200 hover:bg-base-300 flex items-center justify-between rounded-3xl border p-3 transition-colors"
    >
      <div className="flex items-center gap-4">
        {hasValidImage ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="size-12 rounded-2xl object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="from-base-300 to-primary/30 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br">
            <IconPhoto className="text-primary size-6" />
          </div>
        )}
        <div className="flex flex-col">
          <p className="flex-1 text-sm">{user.displayName}</p>
          <p className="truncate text-sm text-slate-500">@{user.handle}</p>
        </div>
      </div>
      {/* TODO: show follow back or following; On following clik - unfollows; */}
      <button className="btn btn-xs">Action</button>
    </Link>
  );
}
