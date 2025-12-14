import EmptyFrame from "@/components/empty-frame";
import { useAuth } from "@/hooks/use-auth";
import { useFollowUser } from "@/hooks/use-follow-user";
import { useGetUserProfile } from "@/hooks/use-get-user-profile";
import { profileQueryOptions } from "@/lib/api";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import PostsGrid from "../../-components/posts-grid";
import ProfileHeader from "../../-components/profile-header";
import Wishlists from "../../-components/wishlists";

export const Route = createFileRoute("/_protected/profile/$userId/$wishlist/")({
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
  },
  component: RouteComponent,
});

function RouteComponent() {
  const authUser = useAuth();
  const navigate = useNavigate();
  const { userId } = Route.useParams();
  const { data: userProfile } = useGetUserProfile({
    userProfileId: userId,
    realtime: authUser?.uid === userId, // Only for own profile
  });
  const {
    isFollowing,
    isRequested,
    hasIncomingRequest,
    targetFollowsMe,
    isPrivateAccount,
  } = useFollowUser({
    userId,
  });

  if (!userProfile) {
    return navigate({
      to: "/profile/$userId/$wishlist",
      params: { userId: authUser.uid, wishlist: "all" },
    });
  }

  const isOwner = authUser?.uid === userId;
  const isPublic = userProfile.isPublic;

  // Centralized access control logic
  const hasFullAccess = isOwner || isPublic || isFollowing;

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
    <div className="flex flex-col gap-6">
      <ProfileHeader
        hasFullAccess={hasFullAccess}
        isOwner={isOwner}
        userProfile={userProfile}
      />
      {hasFullAccess ? (
        <>
          <Wishlists isOwner={isOwner} />

          <PostsGrid />
        </>
      ) : (
        <EmptyFrame text={contextMessage?.message || ""} />
      )}
    </div>
  );
}
