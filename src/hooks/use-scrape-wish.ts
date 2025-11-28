import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scrapeWishUrl } from "../lib/firebase/functions";

import { useNavigate } from "@tanstack/react-router";
import { saveScrapedWish, SCRAPED_WISH_KEY } from "../lib/scraped-wish-storage";
import { toast } from "sonner";

export function useScrapeWish() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: scrapeWishUrl,
    onSuccess: (data) => {
      // 1. Put scraped product into cache
      queryClient.setQueryData([SCRAPED_WISH_KEY], data);
      //  Save scraped product data to localStorage so i can reuse it wif page refreshes, etc; Can also use redis or smth here.
      saveScrapedWish(data);

      toast.success("We've got the information about your wish!");

      // 2. Redirect to the next step
      navigate({
        to: "/new-wish/preview",
      });
    },

    onError(error) {
      console.log("Error scraping wish: ", error);
      return toast.error("Error getting the product info");
    },
  });

  return {
    scrapeWish: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
