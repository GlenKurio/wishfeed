import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { getExistingGiftQueryOptions } from "@/lib/api";

export function useExistingGift(postId: string, isGifter: boolean) {
  const user = useAuth();

  return useQuery(
    getExistingGiftQueryOptions({ postId, userId: user.uid, isGifter }),
  );
}
