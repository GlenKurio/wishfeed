import { profileQueryOptions, userWishlistsQueryOptions } from "@/lib/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profile/$userId")({
  beforeLoad: async ({ context, params }) => {
    const [userProfile, authedUserProfile, wishlists] = await Promise.all([
      context.queryClient.ensureQueryData(profileQueryOptions(params.userId)),
      context.queryClient.ensureQueryData(
        profileQueryOptions(context.user.uid),
      ),
      context.queryClient.ensureQueryData(
        userWishlistsQueryOptions({
          userId: params.userId,
        }),
      ),
    ]);

    if (!authedUserProfile) {
      throw redirect({
        to: "/auth",
      });
    }

    if (!userProfile) {
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: context.user.uid, wishlist: "all" },
      });
    }
    const isFollowing =
      authedUserProfile?.following.includes(params.userId || "") ?? false;
    const isOwner = context.user?.uid === params.userId;
    const isPublic = userProfile.isPublic;

    // Determine access level
    const hasFullAccess = isOwner || isPublic || isFollowing;

    return {
      isFollowing,
      isOwner,
      isPublic,
      hasFullAccess,
      userProfile,
      authedUserProfile,
      wishlists,
    };
  },

  errorComponent: ({ error }) => {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-900">Error</h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-10">
      <Outlet />
    </div>
  );
}
