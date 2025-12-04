import { profileQueryOptions } from "@/hooks/use-get-user-profile";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";

export const Route = createFileRoute("/_protected/profile/$userId")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      profileQueryOptions(params.userId),
    );
  },
  validateSearch: z.object({
    wishlist: z.string().optional().default("all"),
    postId: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-6 lg:py-10">
      <Suspense fallback={<div>Loading…</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
