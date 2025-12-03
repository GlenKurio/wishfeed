import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUserProfileById } from "../lib/firebase/db";
import type { UserProfile } from "@/lib/types";
export const profileQueryOptions = (userProfileId: string) =>
  queryOptions<UserProfile | null>({
    queryKey: ["user-profile", userProfileId],
    queryFn: () => getUserProfileById({ userId: userProfileId }),
    enabled: !!userProfileId,
    staleTime: 60 * 1000,
  });
export function useGetUserProfile({
  userProfileId,
}: {
  userProfileId: string;
}) {
  return useQuery(profileQueryOptions(userProfileId));
}
