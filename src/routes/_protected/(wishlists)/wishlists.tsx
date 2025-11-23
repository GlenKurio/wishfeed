import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(wishlists)/wishlists")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="">Hello "/_protected/(wishlists)/wishlists"!</div>;
}
