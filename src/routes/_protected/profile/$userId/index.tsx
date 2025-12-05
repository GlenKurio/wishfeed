import { profileQueryOptions } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";
import PostsGrid from "../-components/posts-grid";
import ProfileHeader from "../-components/profile-header";
import Wishlists from "../-components/wishlists";
import { useAuth } from "../../../../hooks/use-auth";

export const Route = createFileRoute("/_protected/profile/$userId/")({
  component: RouteComponent,
});
function RouteComponent() {
  const authUser = useAuth();
  const navigate = useNavigate();

  const { userId } = Route.useParams();

  const { data: userProfile } = useSuspenseQuery(profileQueryOptions(userId));

  if (!userProfile) {
    return navigate({
      to: "/profile/$userId",
      params: { userId: authUser.uid },
    });
  }

  const isOwner = authUser?.uid === userId;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <ProfileHeader userProfile={userProfile} isOwner={isOwner} />
      <Wishlists userId={userId} isOwner={isOwner} />
      <Suspense fallback={<>Loading posts!</>}>
        <PostsGrid userId={userId} isOwner={isOwner} />
      </Suspense>
    </div>
  );
}
