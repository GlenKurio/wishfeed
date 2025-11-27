import type { ScrapedWishData } from "./firebase/types";

const KEY = "scraped-wish";

export function saveScrapedWish(wish: ScrapedWishData) {
  localStorage.setItem(KEY, JSON.stringify(wish));
}

export function loadScrapedWish(): ScrapedWishData | null {
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
