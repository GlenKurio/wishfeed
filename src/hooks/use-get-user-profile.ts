import { useQuery } from "@tanstack/react-query";
import { getUserProfileById } from "../lib/firebase/db";

export function useGetUserProfile({
  userProfileId,
}: {
  userProfileId: string;
}) {
  return useQuery({
    queryKey: ["user-proifle", userProfileId],
    queryFn: () => getUserProfileById({ userId: userProfileId }),
    enabled: !!userProfileId,
    staleTime: 60 * 1000,
  });
}
