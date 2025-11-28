import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scrapeWishUrl } from "../lib/firebase/functions";
import { toast } from "../components/toast/toast";
import { useNavigate } from "@tanstack/react-router";
import { saveScrapedWish } from "../lib/scraped-wish-storage";

export function useScrapeWish() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: scrapeWishUrl,
    onSuccess: (data) => {
      // 1. Put scraped product into cache
      queryClient.setQueryData(["scraped-wish"], data);
      //  Save scraped product data to localStorage so i can reuse it wif page refreshes, etc; Can also use redis or smth here.
      saveScrapedWish(data);

      toast.success({ title: "Product scraped!" });

      // 2. Redirect to the next step
      navigate({
        to: "/new-wish/preview",
      });
    },

    onError(error) {
      return toast.error({
        title: "Error getting the product info",
        description: `${error.message}`,
      });
    },
  });

  return {
    scrapeWish: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
