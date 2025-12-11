import { profileQueryOptions } from "@/lib/api";
import { db } from "@/lib/firebase/db";
import type { UserProfile } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

export function useGetUserProfile({
  userProfileId,
  realtime = false,
}: {
  userProfileId: string;
  realtime?: boolean;
}) {
  const queryClient = useQueryClient();
  const query = useQuery(profileQueryOptions(userProfileId));
  useEffect(() => {
    if (!realtime || !userProfileId) return;

    const docRef = doc(db, "users", userProfileId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;

        // Update the query cache with real-time data
        queryClient.setQueryData(["user-profile", userProfileId], data);
      }
    });

    return () => unsubscribe();
  }, [realtime, userProfileId, queryClient]);

  return query;
}
