import { createFileRoute } from "@tanstack/react-router";
import Feed from "../-components/feed-posts/feed";

export const Route = createFileRoute("/_protected/(home)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto pt-8 pb-24 px-4  flex items-center justify-center relative">
      <Feed />
    </main>
  );
}
