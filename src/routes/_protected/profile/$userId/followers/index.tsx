import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profile/$userId/followers/")({
  beforeLoad: ({ context, params }) => {
    if (!context.hasFullAccess)
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: params.userId, wishlist: "all" },
      });
  },

  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/profile/$userId/followers/"!</div>;
}
