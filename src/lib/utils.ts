import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert ISO string to YYYY-MM-DD format for date input
 * Handles both full ISO strings and YYYY-MM-DD strings
 */
export function isoToDateInput(isoString: string | null | undefined): string {
  if (!isoString) return "";

  try {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
      return isoString;
    }

    // Parse full ISO string and convert to local date
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Invalid date string:", isoString, error);
    return "";
  }
}

/**
 * Convert YYYY-MM-DD to ISO string for storage
 * Stores as midnight UTC to avoid timezone issues
 */
export function dateInputToISO(dateString: string | undefined): string {
  if (!dateString) return "";

  try {
    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return "";
    }

    // Store as YYYY-MM-DD (simple, no timezone issues)
    return dateString;

    // OR if you need full ISO with time:
    // const date = new Date(dateString + 'T00:00:00.000Z');
    // return date.toISOString();
  } catch (error) {
    console.error("Invalid date input:", dateString, error);
    return "";
  }
}
