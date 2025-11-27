import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { NewWishType } from "../lib/types";
import { saveWishPostToDb } from "../lib/firebase/db";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createPost = async (newWishData: NewWishType) => {
    // Step 1: Handle image upload if needed
    let imageUrl = newWishData.wish_image;

    if (newWishData.wish_image && isFile(value.wish_image)) {
      imageUrl = await uploadImageToStorage(value.wish_image);
    }

    const wishData = {
      ...newWishData,
      wish_image: imageUrl,
    };
    await saveWishPostToDb(wishData);
    return "success";
  };

  const mutation = useMutation({
    mutationFn: createPost,
  });

  return {
    createPost: mutation.mutate,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
