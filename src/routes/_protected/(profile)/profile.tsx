import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(profile)/profile")({
  component: RouteComponent,
});
// Profile header with info and settings
// Stats, followers, following
// Collections circles - click on one and feed under changes to all the posts(wishes) in the list;
//  Info where to send the gift
function RouteComponent() {
  return <div>Hello "/_protected/(profile)/profile"!</div>;
}
