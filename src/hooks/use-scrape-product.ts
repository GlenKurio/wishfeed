import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scrapeProductUrl } from "../lib/firebase/functions";
import { toast } from "../components/toast/toast";
import { useNavigate } from "@tanstack/react-router";
import { saveScrapedProduct } from "../lib/scraped-product-storage";

export function useScrapeProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: scrapeProductUrl,
    onSuccess: (data) => {
      // 1. Put scraped product into cache
      queryClient.setQueryData(["scraped-product"], data);
      //  Save scraped product data to localStorage so i can reuse it wif page refreshes, etc; Can also use redis or smth here.
      saveScrapedProduct(data);

      toast.success({ title: "Product scraped!" });

      // 2. Redirect to the next step
      navigate({
        to: "/preview",
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
    scrapeProduct: mutation.mutate,
    isPending: mutation.isPending,
    data: mutation.data,
  };
}
