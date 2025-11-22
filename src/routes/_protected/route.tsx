import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authQueryOptions } from "../../lib/firebase/auth";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions);
    if (!user) {
      throw redirect({
        to: "/auth",
        search: {
          tab: "login",
        },
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
