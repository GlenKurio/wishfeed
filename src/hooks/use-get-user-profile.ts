import { profileQueryOptions } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useGetUserProfile({
  userProfileId,
}: {
  userProfileId: string;
}) {
  return useQuery(profileQueryOptions(userProfileId));
}
