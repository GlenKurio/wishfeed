import Avatar from "@/components/avatar";
import { useFollowUser } from "@/hooks/use-follow-user";
import type { UserProfile } from "@/lib/types";
import { IconCake, IconEdit, IconLock } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

export default function ProfileHeader({
  hasFullAccess,
  isOwner,
  userProfile,
}: {
  hasFullAccess: boolean;
  isOwner: boolean;
  userProfile: UserProfile;
}) {
  const isPublic = userProfile?.isPublic;
  const { isFollowing, followUser, unfollowUser, isPending } = useFollowUser({
    userId: userProfile?.uid,
  });

  const canViewPosts = hasFullAccess && userProfile.postsCount > 0;
  const canViewFollowing = hasFullAccess && userProfile.following.length > 0;
  const canViewFollowers = hasFullAccess && userProfile.followers.length > 0;

  // Determine follow button state
  const getFollowButton = () => {
    if (isOwner) return null;

    if (isFollowing) {
      return (
        <button
          className="btn btn-xs btn-primary btn-soft w-full sm:w-auto"
          onClick={unfollowUser}
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Unfollow"}
        </button>
      );
    }

    return (
      <button
        className="btn btn-xs btn-primary w-full sm:w-auto"
        onClick={followUser}
        disabled={isPending}
      >
        {isPending ? "Loading..." : isPublic ? "Follow" : "Request to Follow"}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-2 md:gap-6">
        {/* Avatar */}
        <Avatar src={userProfile?.photoURL} className="w-16 md:w-24" />

        {/* Profile info */}
        <div className="flex flex-1 flex-col gap-1">
          {/* Profile name and actions */}
          <div className="flex items-center gap-4">
            <h1 className="text-foreground leading-tight font-bold md:text-lg lg:text-xl">
              {userProfile?.displayName}
            </h1>

            <div className="flex gap-2">
              {isOwner ? (
                <Link
                  to="/profile/$userId/edit-profile"
                  params={{ userId: userProfile?.uid }}
                  className="btn btn-xs w-full md:w-auto"
                >
                  Edit Profile <IconEdit className="size-3" />
                </Link>
              ) : (
                getFollowButton()
              )}
            </div>
          </div>

          {/* Handle */}
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground mb-1 text-xs md:text-sm">
              @{userProfile?.handle}
            </p>
            {!isPublic && !isOwner && (
              <IconLock className="text-muted-foreground size-3" />
            )}
          </div>

          {/* Stats */}
          <div className="flex w-full items-center gap-2 md:gap-6">
            <StatLink
              to="/profile/$userId/followers"
              params={{ userId: userProfile?.uid }}
              disabled={!canViewFollowers}
              count={userProfile?.followers.length || 0}
              label="Followers"
            />

            <div className="bg-neutral/10 h-4 w-px md:h-6" />

            <StatLink
              to="/profile/$userId/following"
              params={{ userId: userProfile?.uid }}
              disabled={!canViewFollowing}
              count={userProfile?.following.length || 0}
              label="Following"
            />

            <div className="bg-neutral/10 h-4 w-px md:h-6" />

            <StatLink
              to="/profile/$userId/$wishlist/feed"
              params={{ userId: userProfile?.uid, wishlist: "all" }}
              disabled={!canViewPosts}
              count={userProfile?.postsCount || 0}
              label={userProfile?.postsCount === 1 ? "Post" : "Posts"}
            />
          </div>

          {/* Birthday - only show if has access */}
          {hasFullAccess && <ProfileBirthday birthday={userProfile.birthday} />}

          {/* Bio - always visible */}
          {userProfile.bio && (
            <p className="text-base-content/60 mt-2 max-w-md text-xs md:text-sm">
              {userProfile.bio}
            </p>
          )}
        </div>
      </div>
      <Link
        to="/profile/$userId/$wishlist"
        params={{ userId: "vJDEKsrRAvYYxNOShVtYCPvIvBA2", wishlist: "all" }}
      >
        Go to another user
      </Link>
    </div>
  );
}

function StatLink({
  to,
  params,
  disabled,
  count,
  label,
}: {
  to: string;
  params: Record<string, string>;
  disabled: boolean;
  count: number;
  label: string;
}) {
  const content = (
    <>
      <p className="text-foreground text-sm font-bold md:text-lg">{count}</p>
      <p className="text-muted-foreground group-hover:text-foreground text-xs md:text-sm">
        {label}
      </p>
    </>
  );

  if (disabled) {
    return <div className="flex items-center gap-1 md:gap-2">{content}</div>;
  }

  return (
    <Link
      to={to}
      params={params}
      className="flex items-center gap-1 transition-opacity hover:opacity-80 md:gap-2"
    >
      {content}
    </Link>
  );
}

function ProfileBirthday({ birthday }: { birthday?: string | null }) {
  if (!birthday || birthday === "") return null;

  const date = parseISO(birthday);
  const formattedBirthday = format(date, "MMMM do");

  return (
    <div className="mt-2 flex items-center gap-1">
      <IconCake className="size-4 text-rose-300" />
      <span className="text-xs leading-0">{formattedBirthday}</span>
    </div>
  );
}
