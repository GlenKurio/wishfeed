import { deleteWishlist } from "@/lib/firebase/db";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Wishlist } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";

export function useDeleteWishlist() {
  const user = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const deleteWishlistFromDb = async ({ wishlist }: { wishlist: Wishlist }) => {
    // TODO: delete cover from storage!
    await deleteWishlist({ wishlist });

    return { wishlist };
  };

  const mutation = useMutation({
    mutationFn: ({ wishlist }: { wishlist: Wishlist }) =>
      deleteWishlistFromDb({ wishlist }),
    onSuccess: ({ wishlist }) => {
      toast.success(`Wishlist ${wishlist.title} successfully deleted!`);

      queryClient.invalidateQueries({
        queryKey: ["wishlists", "user", user.uid],
      });

      navigate({
        to: "/profile/$userId/manage-wishlists",
        params: { userId: user.uid },
      });
    },
    onError: () => {
      toast.error("Cannot delete wishlist. Try again");
    },
  });

  return {
    deleteWishlist: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
