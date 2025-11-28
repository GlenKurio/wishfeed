import type { ScrapedWishDataWithOriginalUrl } from "./types";

export const SCRAPED_WISH_KEY = "scraped-wish";

export function saveScrapedWish(wish: ScrapedWishDataWithOriginalUrl) {
  localStorage.setItem(SCRAPED_WISH_KEY, JSON.stringify(wish));
}

export function loadScrapedWish(): ScrapedWishDataWithOriginalUrl | null {
  const raw = localStorage.getItem(SCRAPED_WISH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearScrapedWish() {
  localStorage.removeItem(SCRAPED_WISH_KEY);
}
