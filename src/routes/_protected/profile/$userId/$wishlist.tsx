import { userPostsQueryOptions } from "@/lib/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_protected/profile/$userId/$wishlist")({
  validateSearch: z.object({
    postId: z.string().optional(),
  }),
  beforeLoad: async ({ context, params }) => {
    const isDrafts = params.wishlist === "drafts";
    if (isDrafts && params.userId !== context.user.uid) {
      throw redirect({
        to: "/profile/$userId/$wishlist",
        params: { userId: params.userId, wishlist: "all" },
      });
    }
  },

  loader: async ({ context, params }) => {
    const isDrafts = params.wishlist === "drafts";
    await context.queryClient.ensureInfiniteQueryData(
      userPostsQueryOptions({
        userId: params.userId,
        published: !isDrafts,
        wishlist: params.wishlist,
      }),
    );
  },

  component: RouteComponent,
});
function RouteComponent() {
  return <Outlet />;
}
