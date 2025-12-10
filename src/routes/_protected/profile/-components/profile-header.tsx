import { Link } from "@tanstack/react-router";

import Avatar from "@/components/avatar";
import { useFollowUser } from "@/hooks/use-follow-user";
import type { UserProfile } from "@/lib/types";
import { IconCake, IconEdit } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
export default function ProfileHeader({
  userProfile,
  isOwner,
}: {
  userProfile: UserProfile;
  isOwner: boolean;
}) {
  const { isFollowing } = useFollowUser({ userId: userProfile?.uid });

  return (
    <div className="w-full">
      <div className="flex items-start gap-2 md:gap-6">
        {/* Avatar */}
        <Avatar src={userProfile?.photoURL} className="w-16 md:w-24" />
        {/* Proifle info: title, handle, actions, bio */}
        <div className="flex flex-col">
          {/* Profile name with handle and profile actions */}

          {/* Profile title */}
          <div className="flex items-center gap-4">
            <h1 className="text-foreground leading-tight font-bold md:text-lg lg:text-xl">
              {userProfile?.displayName}
            </h1>
            <div className="">
              {isOwner ? (
                <>
                  <Link
                    to="/profile/$userId/edit-profile"
                    params={{ userId: userProfile?.uid }}
                    className="btn btn-xs w-full md:w-auto"
                  >
                    Edit Profile <IconEdit className="size-3" />
                  </Link>
                  {/* <Link
                    to="/profile/$userId/$wishlist"
                    params={{
                      userId: "JyLsRANwzbSZukKtZ0WqYjY1moh2",
                      wishlist: "all",
                    }}
                    className="btn btn-sm md:btn-md flex-1 sm:flex-none"
                  >
                    Go to another User
                  </Link> */}
                </>
              ) : isFollowing ? (
                <button className="btn w-full sm:w-auto">Unfollow</button>
              ) : (
                <button className="btn w-full sm:w-auto">Follow</button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mb-1 text-xs md:text-sm">
            @{userProfile?.handle}
          </p>
          <div className="flex w-full items-center gap-2 md:gap-6">
            <Link
              to="/profile/$userId/followers"
              params={{
                userId: userProfile?.uid,
              }}
              className="flex items-center gap-1 md:gap-2"
            >
              <p className="text-foreground text-sm font-bold md:text-lg">
                {userProfile?.followers.length || 0}
              </p>
              <p className="text-muted-foreground group-hover:text-foreground text-xs md:text-sm">
                Followers
              </p>
            </Link>

            <div className="bg-neutral/10 h-4 w-px md:h-8" />

            <Link
              to="/profile/$userId/following"
              params={{
                userId: userProfile?.uid,
              }}
              className="flex items-center gap-1 md:gap-2"
            >
              <p className="text-foreground text-sm font-bold md:text-lg">
                {userProfile?.following.length || 0}
              </p>
              <p className="text-muted-foreground group-hover:text-foreground text-xs md:text-sm">
                Following
              </p>
            </Link>

            <div className="bg-neutral/10 h-4 w-px md:h-8" />

            <Link
              to="/profile/$userId/$wishlist/feed"
              params={{
                userId: userProfile?.uid,
                wishlist: "all",
              }}
              disabled={!userProfile.postsCount || userProfile.postsCount === 0}
              className="flex items-center gap-1 md:gap-2"
            >
              <p className="text-foreground text-sm font-bold md:text-lg">
                {userProfile?.postsCount || 0}
              </p>
              <p className="text-muted-foreground group-hover:text-foreground text-xs md:text-sm">
                {userProfile?.postsCount === 1 ? "Post" : "Posts"}
              </p>
            </Link>
          </div>
          <ProfileBirthday birthday={userProfile.birthday} />

          {/* Bio */}
          <p className="text-base-content/60 mt-2 max-w-md text-xs md:text-sm">
            {" "}
            {userProfile.bio}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileBirthday({ birthday }: { birthday?: string | null }) {
  let formattedBirthday: string | null = null;

  if (!birthday || birthday === "") return null;

  const date = parseISO(birthday);
  formattedBirthday = format(date, "MMMM do");

  return (
    <>
      {formattedBirthday && (
        <div className="mt-2 flex items-center gap-1">
          <IconCake className="size-4 text-rose-300" />
          <span className="text-xs leading-0">{formattedBirthday}</span>
        </div>
      )}
    </>
  );
}
