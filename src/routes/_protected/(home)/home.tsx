import { createFileRoute } from "@tanstack/react-router";
import Feed from "../-components/feed";

export const Route = createFileRoute("/_protected/(home)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto py-16  flex items-center justify-center">
      <Feed />
    </main>
  );
}
