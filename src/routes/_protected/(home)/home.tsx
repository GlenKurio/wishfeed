import { createFileRoute } from "@tanstack/react-router";
import Feed from "../-components/feed-posts/feed";

export const Route = createFileRoute("/_protected/(home)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 flex items-center justify-center">
      <Feed />
    </div>
  );
}
