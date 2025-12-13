import Avatar from "@/components/avatar";
import { useFollowUser } from "@/hooks/use-follow-user";
import type { UserProfile } from "@/lib/types";
import {
  IconCake,
  IconEdit,
  IconLock,
  IconCheck,
  IconX,
  IconUserPlus,
} from "@tabler/icons-react";
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
  const {
    isFollowing,
    isRequested,
    hasIncomingRequest,
    shouldShowFollowBack,
    targetFollowsMe,
    isPrivateAccount,
    followUser,
    acceptRequest,
    rejectRequest,
    isPending,
  } = useFollowUser({
    userId: userProfile?.uid,
  });

  const canViewPosts = hasFullAccess && userProfile.postsCount > 0;
  const canViewFollowing = hasFullAccess && userProfile.followingCount > 0;
  const canViewFollowers = hasFullAccess && userProfile.followersCount > 0;

  // Determine follow button state and appearance
  const getFollowButtons = () => {
    if (isOwner) return null;

    // Priority 1 - Has incoming request: show Accept/Reject buttons
    if (hasIncomingRequest) {
      return (
        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-primary w-full sm:w-auto"
            onClick={acceptRequest}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Accept"}
          </button>
          <button
            className="btn btn-xs btn-neutral btn-soft w-full sm:w-auto"
            onClick={rejectRequest}
            disabled={isPending}
          >
            Decline
          </button>
        </div>
      );
    }

    // Priority 2 - They follow you, show "Follow Back"
    if (shouldShowFollowBack) {
      return (
        <button
          className="btn btn-xs btn-primary w-full sm:w-auto"
          onClick={followUser}
          disabled={isPending}
        >
          {isPending ? (
            "Loading..."
          ) : (
            <>
              <IconUserPlus className="size-3" />
              Follow Back
            </>
          )}
        </button>
      );
    }

    // Priority 3 - Following state
    if (isFollowing) {
      return (
        <button
          className="btn btn-xs btn-primary btn-soft w-full sm:w-auto"
          onClick={followUser}
          disabled={isPending}
        >
          {isPending ? (
            "Loading..."
          ) : (
            <>
              <IconCheck className="size-3" />
              Following
            </>
          )}
        </button>
      );
    }

    // Priority 4 - Requested state
    if (isRequested) {
      return (
        <button
          className="btn btn-xs btn-neutral btn-soft w-full sm:w-auto"
          onClick={followUser}
          disabled={isPending}
        >
          {isPending ? (
            "Loading..."
          ) : (
            <>
              <IconX className="size-3" />
              Requested
            </>
          )}
        </button>
      );
    }

    // Priority 5 - Default state
    return (
      <button
        className="btn btn-xs btn-primary w-full sm:w-auto"
        onClick={followUser}
        disabled={isPending}
      >
        {isPending ? "Loading..." : isPrivateAccount ? "Request" : "Follow"}
      </button>
    );
  };

  // Helper message for context
  const getContextMessage = () => {
    if (hasIncomingRequest) {
      return {
        type: "info" as const,
        message: `${userProfile.displayName} wants to follow you.`,
      };
    }

    if (targetFollowsMe && !isFollowing) {
      return {
        type: "info" as const,
        message: `${userProfile.displayName} follows you.${isPrivateAccount ? " Click 'Follow Back' to follow them (no request needed)." : ""}`,
      };
    }

    if (isPrivateAccount && !hasFullAccess && !isOwner) {
      return {
        type: "default" as const,
        message: isRequested
          ? "Follow request pending. You'll see their content once they accept."
          : "This account is private. Send a follow request to see their content.",
      };
    }

    return null;
  };

  const contextMessage = getContextMessage();

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
                getFollowButtons()
              )}
            </div>
          </div>

          {/* Handle and privacy indicator */}
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground mb-1 text-xs md:text-sm">
              @{userProfile?.handle}
            </p>
            {isPrivateAccount && !isOwner && (
              <IconLock className="text-muted-foreground size-3" />
            )}
          </div>

          {/* Context message */}
          {contextMessage && (
            <div
              className={`mt-2 rounded-lg px-3 py-2 ${
                contextMessage.type === "info"
                  ? "border border-blue-200 bg-blue-50"
                  : "bg-muted/50"
              }`}
            >
              <p
                className={`text-xs ${
                  contextMessage.type === "info"
                    ? "text-blue-700"
                    : "text-muted-foreground"
                }`}
              >
                {contextMessage.message}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex w-full items-center gap-2 md:gap-6">
            <StatLink
              to="/profile/$userId/followers"
              params={{ userId: userProfile?.uid }}
              disabled={!canViewFollowers}
              count={userProfile?.followersCount || 0}
              label="Followers"
            />

            <div className="bg-neutral/10 h-4 w-px md:h-6" />

            <StatLink
              to="/profile/$userId/following"
              params={{ userId: userProfile?.uid }}
              disabled={!canViewFollowing}
              count={userProfile?.followingCount || 0}
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
    return (
      <div className="flex items-center gap-1 opacity-50 md:gap-2">
        {content}
      </div>
    );
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
