import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(home)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  // TODO: get feed posts
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-6 lg:py-10">
      {/* <Feed /> */}
    </div>
  );
}
