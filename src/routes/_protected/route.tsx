import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authQueryOptions } from "../../lib/firebase/auth";
import AppHeader from "./-components/app-header";
import Dock from "./-components/dock";
import Gradient from "../../components/gradient";

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
    <div className="relative flex h-screen flex-col overflow-hidden py-11 md:py-13">
      <Gradient />
      <div className="fixed top-0 right-0 left-0 z-50">
        <AppHeader />
      </div>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <Dock />
    </div>
  );
}
