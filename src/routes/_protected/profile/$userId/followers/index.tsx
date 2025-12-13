import PageHeading from "@/components/page-heading";
import {
  profileQueryOptions,
  searchFollowersQueryOptions,
  userFollowersQueryOptions,
} from "@/lib/api";
import { checkProfileAccess } from "@/lib/utils";
import { IconArrowLeft, IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Loader, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import UserCard from "../../-components/user-card";

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
      userFollowersQueryOptions({
        userId: params.userId,
      }),
    );
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { userProfile } = Route.useRouteContext();
  const { userId } = Route.useParams();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // isLoading,
    isError,
    error,
  } = useInfiniteQuery(
    userFollowersQueryOptions({
      userId: userProfile.uid,
    }),
  );

  const allFollowers = data?.pages.flatMap((page) => page.followers) ?? [];

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchInput, {
    wait: 500,
  });

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery(
    searchFollowersQueryOptions({ userId, searchTerm: debouncedQuery }),
  );

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || searchInput) return; // Don't load more when searching

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
  };

  console.log("SEARCH RESULT: ", searchResults);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          to={"/profile/$userId/$wishlist"}
          params={{
            userId: userId,
            wishlist: "all",
          }}
          className="btn btn-circle btn-ghost btn-sm"
        >
          <IconArrowLeft className="size-4" />
        </Link>
        <PageHeading title="Followers" />
      </div>

      <div className="flex w-full flex-col">
        <label className="label mb-1 ml-1">
          <span className="label-text text-sm font-medium lg:text-base">
            Search followers
          </span>
        </label>
        <label
          className={`input input-bordered border-base-content/50 flex w-full items-center gap-2`}
        >
          <IconSearch width="20" height="20" />
          <input
            name="Search term"
            type="text"
            value={searchInput}
            placeholder="Start typing to find users"
            onChange={(e) => handleSearchChange(e)}
            className={`grow`}
          />
          {searchInput && !isLoadingSearch ? (
            <button className="btn btn-xs btn-circle btn-ghost btn-error">
              <IconX className="size-4" onClick={handleClearSearch} />
            </button>
          ) : searchInput && isLoadingSearch ? (
            <button className="btn btn-xs btn-ghost btn-circle">
              <Loader className="h-4 w-4 animate-spin" />
            </button>
          ) : null}
        </label>
      </div>
      <div
        className={
          isLoadingSearch ||
          isError ||
          (searchInput && searchResults?.users.length === 0) ||
          (!searchInput && allFollowers.length === 0)
            ? "border-primary/50 rounded-3xl border-2 border-dashed"
            : "rounded-3xl"
        }
      >
        {isLoadingSearch ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-error">
              Error loading followers: {error?.message}
            </p>
          </div>
        ) : searchInput && searchResults?.users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="text-base-content/75 mx-auto mb-3 size-10" />
            <p className="text-base-content">
              No followers found matching your search
            </p>
          </div>
        ) : !searchInput && allFollowers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="text-base-content/75 mx-auto mb-3 h-12 w-12" />
            <p className="text-base-content">No followers yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {(searchInput ? (searchResults?.users ?? []) : allFollowers).map(
                (follower) => (
                  <UserCard key={follower.uid} user={follower} />
                ),
              )}
            </div>
            {/* Infinite scroll trigger - only show when not searching */}
            {!searchInput && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader className="text-primary size-4 animate-spin" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
