import { createFileRoute } from "@tanstack/react-router";
import { loadScrapedProduct } from "../../../lib/scraped-product-storage";

export const Route = createFileRoute("/_protected/(new-wish)/preview")({
  loader: ({ context: { queryClient } }) => {
    // 1. Try cache
    const cached = queryClient.getQueryData(["scraped-product"]);
    if (cached) return cached;

    // 2. Fallback to localStorage
    const persisted = loadScrapedProduct();
    if (persisted) {
      queryClient.setQueryData(["scraped-product"], persisted);
      return persisted;
    }

    // 3. Nothing found
    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen">Hello "/_protected/(new-wish)/preview"!</div>
  );
}
