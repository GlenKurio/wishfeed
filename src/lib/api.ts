import { queryOptions } from "@tanstack/react-query";
import type { UserProfile } from "./types";
import { getUserProfileById } from "./firebase/db";

export const profileQueryOptions = (userProfileId: string) =>
  queryOptions<UserProfile | null>({
    queryKey: ["user-profile", userProfileId],
    queryFn: () => getUserProfileById({ userId: userProfileId }),
    enabled: !!userProfileId,
    staleTime: 60 * 1000,
  });
