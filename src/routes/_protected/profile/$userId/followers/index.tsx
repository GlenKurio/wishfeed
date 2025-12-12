import {
  profileQueryOptions,
  userFollowersSearchQueryOptions,
} from "@/lib/api";
import { checkProfileAccess } from "@/lib/utils";
import { useDebouncer } from "@tanstack/react-pacer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, X, Users, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_protected/profile/$userId/followers/")({
  beforeLoad: async ({ context, params }) => {
    const userProfile = await context.queryClient.ensureQueryData(
      profileQueryOptions(params.userId),
    );

    if (!userProfile) {
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: context.user.uid, wishlist: "all" },
      });
    }

    const access = await checkProfileAccess({
      currentUserId: context.user.uid,
      targetProfile: userProfile,
    });

    // Redirect if no access and no followers to show
    if (!access.hasFullAccess || userProfile.followersCount <= 0) {
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: params.userId, wishlist: "all" },
      });
    }

    return {
      userProfile,
      ...access,
    };
  },

  loader: async ({ context, params }) => {
    await context.queryClient.ensureInfiniteQueryData(
      userFollowersSearchQueryOptions({
        userId: params.userId,
      }),
    );
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { userProfile } = Route.useRouteContext();
  const { userId } = Route.useParams();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebouncer = useDebouncer(
    (query: string) => setDebouncedSearch(query),
    { wait: 500 },
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery(
    userFollowersSearchQueryOptions({
      userId: userProfile.uid,
      searchTerm: searchInput || undefined,
      pageSize: 30,
    }),
  );
  console.log("ERROR: ", error);

  const allFollowers = data?.pages.flatMap((page) => page.followers) ?? [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    // searchDebouncer(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Link
              to="/profile/$userId/$wishlist"
              params={{ userId, wishlist: "all" }}
              className="rounded-full p-2 transition-colors hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Followers</h1>
              <p className="text-sm text-slate-600">
                {userProfile.followersCount}{" "}
                {userProfile.followersCount === 1 ? "follower" : "followers"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search followers..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-12 pl-12 text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-red-600">
                Error loading followers: {error.message}
              </p>
            </div>
          ) : allFollowers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
                {searchInput
                  ? "No followers found matching your search"
                  : "No followers yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {allFollowers.map((follower) => (
                  <Link
                    key={follower.uid}
                    to="/profile/$userId/$wishlist"
                    params={{ userId: follower.uid, wishlist: "all" }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50"
                  >
                    <img
                      src={follower.photoURL || "/default-avatar.png"}
                      alt={follower.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {follower.displayName}
                      </p>
                      {follower.displayName && (
                        <p className="truncate text-sm text-slate-500">
                          @{follower.handle}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="border-t border-slate-100 p-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full rounded-lg bg-indigo-50 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
