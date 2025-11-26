import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(new-wish)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex h-full items-center justify-center px-4 py-10 lg:py-16">
      <Outlet />
    </div>
  );
}
