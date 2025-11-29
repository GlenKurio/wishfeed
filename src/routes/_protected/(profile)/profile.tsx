import { createFileRoute } from "@tanstack/react-router";
import UserPostsList from "./-components/user-posts-list";
import { useAuth } from "../../../hooks/use-auth";

export const Route = createFileRoute("/_protected/(profile)/profile")({
  component: RouteComponent,
});
// Profile header with info and settings
// Stats, followers, following
// Collections circles - click on one and feed under changes to all the posts(wishes) in the list;
//  Info where to send the gift
function RouteComponent() {
  const user = useAuth();
  return (
    <div>
      Hello "/_protected/(profile)/profile"!
      <UserPostsList userId={user.uid} />
    </div>
  );
}
