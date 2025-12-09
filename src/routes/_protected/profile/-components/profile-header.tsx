import { Link } from "@tanstack/react-router";

import Avatar from "@/components/avatar";
import { useFollowUser } from "@/hooks/use-follow-user";
import type { UserProfile } from "@/lib/types";

export default function ProfileHeader({
  userProfile,
  isOwner,
}: {
  userProfile: UserProfile;
  isOwner: boolean;
}) {
  const { isFollowing } = useFollowUser({ userId: userProfile?.uid });

  return (
    <>
      <div className="bg-background w-full">
        <div className="mx-auto">
          {/* Main profile section */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left side: Avatar + Info + Stats */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex items-center gap-4">
                <Avatar src={userProfile?.photoURL} className="w-14 md:w-20" />
                <div className="shrink-0">
                  <h1 className="text-foreground text-2xl leading-tight font-bold">
                    {userProfile?.displayName}
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    @{userProfile?.handle}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 px-2">
                <div className="flex w-full items-center gap-6 md:gap-8">
                  <Link
                    to="/profile/$userId/followers"
                    params={{
                      userId: userProfile?.uid,
                    }}
                    className="group transition-colors hover:opacity-80"
                  >
                    <div>
                      <p className="text-foreground text-lg font-bold md:text-xl">
                        {userProfile?.followers.length || 0}
                      </p>
                      <p className="text-muted-foreground group-hover:text-foreground text-sm">
                        Followers
                      </p>
                    </div>
                  </Link>

                  <div className="bg-neutral/10 h-10 w-px" />

                  <Link
                    to="/profile/$userId/following"
                    params={{
                      userId: userProfile?.uid,
                    }}
                  >
                    <p className="text-foreground text-lg font-bold md:text-xl">
                      {userProfile?.following.length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Following</p>
                  </Link>

                  <div className="bg-neutral/10 h-10 w-px" />

                  <Link
                    to="/profile/$userId/$wishlist/feed"
                    params={{
                      userId: userProfile?.uid,
                      wishlist: "all",
                    }}
                    disabled={
                      !userProfile.postsCount || userProfile.postsCount === 0
                    }
                  >
                    <p className="text-foreground text-lg font-bold md:text-xl">
                      {userProfile?.postsCount || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {userProfile?.postsCount === 1 ? "Post" : "Posts"}
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <div className="">
              {isOwner ? (
                <>
                  <Link
                    to="/profile/$userId/edit-profile"
                    params={{ userId: userProfile?.uid }}
                    className="btn btn-sm md:btn-md w-full md:w-auto"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/profile/$userId/$wishlist"
                    params={{
                      userId: "JyLsRANwzbSZukKtZ0WqYjY1moh2",
                      wishlist: "all",
                    }}
                    className="btn btn-sm md:btn-md flex-1 sm:flex-none"
                  >
                    Go to another User
                  </Link>
                </>
              ) : isFollowing ? (
                <button className="btn w-full sm:w-auto">Unfollow</button>
              ) : (
                <button className="btn w-full sm:w-auto">Follow</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
