import { useAuth } from "./use-auth";
import { useGetUserProfile } from "./use-get-user-profile";

export function useFollowUser({ userId }: { userId: string }) {
  const authUser = useAuth();
  const { data: authUserProfile } = useGetUserProfile({
    userProfileId: authUser?.uid,
  });
  const isFollowing = authUserProfile?.following.includes(userId) ?? false;
  return { isFollowing };
}
