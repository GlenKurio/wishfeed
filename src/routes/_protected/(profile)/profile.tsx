import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(profile)/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/(profile)/profile"!</div>;
}
