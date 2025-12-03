import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import PostsGrid from "../-components/posts-grid";
import ProfileHeader from "../-components/profile-header";
import Wishlists from "../-components/wishlists";

export const Route = createFileRoute("/_protected/profile/$userId/")({
  // TODO: get the posts in loader
  component: RouteComponent,
});
// Profile header with info and settings
// Stats, followers, following
// Collections circles - click on one and feed under changes to all the posts(wishes) in the list;
//  Info where to send the gift
function RouteComponent() {
  const { userProfile } = useRouteContext({
    from: "/_protected/profile/$userId",
  });
  const { user } = useRouteContext({ from: "/_protected" });
  const isOwner = user?.uid === userProfile?.uid;
  if (!userProfile || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <ProfileHeader userProfile={userProfile} isOwner={isOwner} />
      <Wishlists userId={userProfile.uid} isOwner={isOwner} />
      <PostsGrid userId={userProfile.uid} isOwner={isOwner} />
    </div>
  );
}
