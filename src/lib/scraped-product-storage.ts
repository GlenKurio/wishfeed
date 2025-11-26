// lib/scraped-product-storage.ts

import type { ScrapeProductData } from "./firebase/types";

const KEY = "scraped-product";

export function saveScrapedProduct(product: ScrapeProductData) {
  localStorage.setItem(KEY, JSON.stringify(product));
}

export function loadScrapedProduct(): ScrapeProductData | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearScrapedProduct() {
  localStorage.removeItem(KEY);
}
