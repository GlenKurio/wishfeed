import { saveWishlistToDb } from "@/lib/firebase/db";
import { uploadWishlistImage } from "@/lib/firebase/storage";
import type { CreateWishlist } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "./use-auth";

export function useCreateWishlist() {
  const user = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createWishlist = async (
    wishlistData: CreateWishlist,
    wishlistId?: string,
    previousPostIds?: string[],
  ) => {
    // 1. Handle image upload if needed
    let imageUrl = wishlistData.cover_image;

    // Check if it's a base64 string (starts with "data:")
    if (wishlistData.cover_image.startsWith("data:")) {
      // Convert base64 back to File for upload
      const base64Data = wishlistData.cover_image;
      const blob = await fetch(base64Data).then((r) => r.blob());
      const file = new File([blob], "image.jpg", { type: blob.type });

      imageUrl = await uploadWishlistImage(file);
    } else {
      imageUrl = wishlistData.cover_image; // URL already
    }

    // 3. Construct wish data with Cover image url, original product url and affiliate link
    const wishlistDataWithImage: CreateWishlist = {
      ...wishlistData,
      cover_image: imageUrl,
    };

    // 4. Save the post to Firestore
    const result = await saveWishlistToDb(
      wishlistDataWithImage,
      wishlistId,
      previousPostIds,
    );
    return { result };
  };

  const mutation = useMutation({
    mutationFn: ({
      wishlistData,
      wishlistId,
      previousPostIds,
    }: {
      wishlistData: CreateWishlist;
      wishlistId?: string;
      previousPostIds?: string[];
    }) => createWishlist(wishlistData, wishlistId, previousPostIds),

    onSuccess: ({ result }) => {
      toast.success("Wishlist successfully saved!");

      queryClient.invalidateQueries({
        queryKey: ["wishlists", "user", user.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", "user", user.uid, result.id],
      });

      navigate({
        to: "/profile/$userId/manage-wishlists",
        params: { userId: user.uid },
      });
    },

    onError: () => {
      toast.error("Cannot create or update wishlist. Try again");
    },
  });

  return {
    createWishlist: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
