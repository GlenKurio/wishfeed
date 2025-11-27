import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/new-wish")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-6 lg:py-10">
      <Outlet />
    </div>
  );
}
