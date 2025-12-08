import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profile/$user/following/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/profile/$userId/following/"!</div>;
}
