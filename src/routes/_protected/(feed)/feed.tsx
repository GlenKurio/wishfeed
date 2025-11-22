import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(feed)/feed")({
  component: RouteComponent,
});

function RouteComponent() {
  return <main className="relative">This is feed page</main>;
}
