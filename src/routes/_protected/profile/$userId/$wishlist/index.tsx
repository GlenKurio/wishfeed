import EmptyFrame from "@/components/empty-frame";
import { createFileRoute, redirect } from "@tanstack/react-router";
import PostsGrid from "../../-components/posts-grid";
import ProfileHeader from "../../-components/profile-header";
import Wishlists from "../../-components/wishlists";

export const Route = createFileRoute("/_protected/profile/$userId/$wishlist/")({
  beforeLoad: ({ context }) => {
    if (!context.userProfile) {
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: context.user.uid, wishlist: "all" },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasFullAccess } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader />
      {hasFullAccess ? (
        <>
          <Wishlists />
          <PostsGrid />
        </>
      ) : (
        <EmptyFrame text="This profile is private. You need to follow this user to see their profile." />
      )}
    </div>
  );
}
