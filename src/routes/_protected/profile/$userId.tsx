import { profileQueryOptions, userPostsQueryOptions } from "@/lib/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";

export const Route = createFileRoute("/_protected/profile/$userId")({
  validateSearch: z.object({
    wishlist: z.string().optional().default("all"),
    postId: z.string().optional(),
  }),
  beforeLoad: async ({ context, params }) => {
    const userProfile = await context.queryClient.ensureQueryData(
      profileQueryOptions(params.userId),
    );

    if (!userProfile)
      throw redirect({
        to: "/profile/$userId",
        params: { userId: context.user.uid },
      });
  },
  loaderDeps: ({ search: { postId, wishlist } }) => ({ postId, wishlist }),
  loader: async ({ context, params, deps: { wishlist } }) => {
    const isDrafts = wishlist === "drafts";
    await context.queryClient.ensureInfiniteQueryData(
      userPostsQueryOptions({
        userId: params.userId,
        published: !isDrafts,
        wishlist,
      }),
    );

    // TODO: fetch user wishlists
  },

  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-10">
      <Suspense fallback={<div>Loading profile…</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
