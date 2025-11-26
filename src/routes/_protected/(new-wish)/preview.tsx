import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(new-wish)/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/(new-wish)/preview"!</div>;
}
