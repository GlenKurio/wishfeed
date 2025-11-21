import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(feed)/feed")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/(home)/home"!</div>;
}
