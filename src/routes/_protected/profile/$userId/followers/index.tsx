import { profileQueryOptions } from "@/lib/api";
import { checkProfileAccess } from "@/lib/utils";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
    if (!access.hasFullAccess || userProfile.followersCount > 0) {
      throw redirect({
        to: "/profile/$userId",
        params: { userId: params.userId },
      });
    }

    return {
      userProfile,
      ...access,
    };
  },

  loader: async ({ context }) => {},

  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/profile/$userId/followers/"!</div>;
}
