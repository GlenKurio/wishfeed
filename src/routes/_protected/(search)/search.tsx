import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(search)/search")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/(search)/search"!</div>;
}
