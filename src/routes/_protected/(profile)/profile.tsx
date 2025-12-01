import { createFileRoute } from "@tanstack/react-router";
import UserPostsList from "./-components/posts-grid";
import { useAuth } from "../../../hooks/use-auth";
import ProfileHeader from "./-components/profile-header";
import z from "zod";
import Wishlists from "./-components/wishlists";
import PostsGrid from "./-components/posts-grid";

export const Route = createFileRoute("/_protected/(profile)/profile")({
  validateSearch: z.object({
    wishlist: z.string().optional().default("all"),
  }),
  component: RouteComponent,
});
// Profile header with info and settings
// Stats, followers, following
// Collections circles - click on one and feed under changes to all the posts(wishes) in the list;
//  Info where to send the gift
function RouteComponent() {
  const user = useAuth();
  // Use tanstack router to set the params to collection and use it to filter the posts
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <ProfileHeader />
      <Wishlists />
      <PostsGrid userId={user.uid} />
    </div>
  );
}
