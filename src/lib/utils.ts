import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the current Academic Year string.
 * Assumes AY starts in June.
 */
export function getAcademicYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed (5 is June)
  const year = date.getFullYear();
  
  if (month >= 5) { // June (5) to December (11)
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else { // January (0) to May (4)
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}
