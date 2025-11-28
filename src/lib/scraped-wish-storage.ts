import type { ScrapedWishDataWithOriginalUrl } from "./types";

const KEY = "scraped-wish";

export function saveScrapedWish(wish: ScrapedWishDataWithOriginalUrl) {
  localStorage.setItem(KEY, JSON.stringify(wish));
}

export function loadScrapedWish(): ScrapedWishDataWithOriginalUrl | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearScrapedWish() {
  localStorage.removeItem(KEY);
}
