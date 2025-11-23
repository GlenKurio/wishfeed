import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { useAuthListener } from "../hooks/use-auth-listener";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});

function Root() {
  useAuthListener();
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />

      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          // unstyled: true,
          style: {
            borderRadius: "100px",
          },
        }}
      />
    </>
  );
}
