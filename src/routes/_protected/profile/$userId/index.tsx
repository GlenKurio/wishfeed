import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import PostsGrid from "../-components/posts-grid";
import ProfileHeader from "../-components/profile-header";
import UserNotFound from "../-components/user-not-found";
import Wishlists from "../-components/wishlists";
import { useAuth } from "../../../../hooks/use-auth";
import { profileQueryOptions } from "@/lib/api";

export const Route = createFileRoute("/_protected/profile/$userId/")({
  component: RouteComponent,
});
// Profile header with info and settings
// Stats, followers, following
// Collections circles - click on one and feed under changes to all the posts(wishes) in the list;
//  Info where to send the gift
function RouteComponent() {
  const authUser = useAuth();

  const { userId } = Route.useParams();

  const { data: userProfile } = useSuspenseQuery(profileQueryOptions(userId));

  // Handle the "not found" case
  if (!userProfile) {
    return <UserNotFound />;
  }
  // const{
  //   data: userProfile,
  //   isLoading,
  //   error,
  // } = useGetUserProfile({
  //   userProfileId: userId,
  // });

  // // 1. Handle the loading state first.
  // if (isLoading) {
  //   return <>Loading user profile...</>;
  // }

  // // 2. Handle any potential errors.
  // if (error) {
  //   return <>Error: {error.message}</>;
  // }

  // // 3. Handle the "not found" case. If we are not loading and there's no error,
  // // but we still don't have a userProfile, then the user doesn't exist.
  // if (!userProfile) {
  //   return <UserNotFound />;
  // }

  const isOwner = authUser?.uid === userId;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <ProfileHeader userProfile={userProfile} isOwner={isOwner} />
      <Wishlists userId={userId} isOwner={isOwner} />
      <PostsGrid userId={userId} isOwner={isOwner} />
    </div>
  );
}
