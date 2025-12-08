import {
  profileQueryOptions,
  userPostsQueryOptions,
  userWishlistsQueryOptions,
} from "@/lib/api";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";

export const Route = createFileRoute("/_protected/profile/$userId")({
  // validateSearch: z.object({
  //   postId: z.string().optional(),
  // }),
  // loaderDeps: ({ search: { postId } }) => ({ postId }),
  beforeLoad: async ({ context, params, search }) => {
    const userProfile = await context.queryClient.ensureQueryData(
      profileQueryOptions(params.userId),
    );

    if (!userProfile)
      throw redirect({
        to: "/profile/$userId",
        params: { userId: context.user.uid },
      });
  },

  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      userWishlistsQueryOptions({
        userId: params.userId,
      }),
    );
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
      <Suspense fallback={<div>Loading profile…</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
