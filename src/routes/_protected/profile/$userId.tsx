import { createFileRoute, Outlet } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_protected/profile/$userId")({
  validateSearch: z.object({
    wishlist: z.string().optional().default("all"),
    postId: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
