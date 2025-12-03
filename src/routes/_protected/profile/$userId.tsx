import { profileQueryOptions } from "@/hooks/use-get-user-profile";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import z from "zod";
import UserNotFound from "./-components/user-not-found";

export const Route = createFileRoute("/_protected/profile/$userId")({
  beforeLoad: async ({ context, params }) => {
    const userProfile = await context.queryClient.ensureQueryData(
      profileQueryOptions(params.userId),
    );
    if (!userProfile) {
      return <UserNotFound />;
    }
    return {
      userProfile,
    };
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
      <Outlet />
    </div>
  );
}
