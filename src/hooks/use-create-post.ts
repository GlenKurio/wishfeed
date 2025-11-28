import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { NewWishType } from "../lib/types";
import { saveWishPostToDb } from "../lib/firebase/db";
import { uploadPostImage } from "../lib/firebase/storage";
import { swapUrl } from "../lib/firebase/functions";
import { toast } from "sonner";
import {
  clearScrapedWish,
  SCRAPED_WISH_KEY,
} from "../lib/scraped-wish-storage";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createPost = async (newWishData: NewWishType) => {
    // 1. Handle image upload if needed
    let imageUrl = newWishData.wish_image;

    // Check if it's a base64 string (starts with "data:")
    if (newWishData.wish_image.startsWith("data:")) {
      // Convert base64 back to File for upload
      const base64Data = newWishData.wish_image;
      const blob = await fetch(base64Data).then((r) => r.blob());
      const file = new File([blob], "image.jpg", { type: blob.type });

      imageUrl = await uploadPostImage(file);
    } else {
      imageUrl = newWishData.wish_image; // URL already
    }

    // 2. Swap the url
    const affiliateLink = await swapUrl(newWishData.wish_url);

    // 3. Construct wish data with Cover image url, original product url and affiliate link
    const wishData = {
      ...newWishData,
      wish_image: imageUrl,
    };

    // 4. Save the post to Firestore
    await saveWishPostToDb(wishData, affiliateLink);
  };

  const mutation = useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      toast.success("You've made a wish!");
      clearScrapedWish();
      queryClient.setQueryData([SCRAPED_WISH_KEY], null);

      navigate({
        to: "/home",
      });
    },
  });

  return {
    createPost: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
