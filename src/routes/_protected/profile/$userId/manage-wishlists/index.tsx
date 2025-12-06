import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/profile/$userId/manage-wishlists/",
)({
  beforeLoad: ({ context, params }) => {
    const authUserId = context.user?.uid;
    const profileId = params.userId;

    if (authUserId !== profileId) {
      throw redirect({
        to: "/profile/$userId/manage-wishlists",
        params: { userId: authUserId },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/profile/$userId/manage-wishlists/"!</div>;
}
