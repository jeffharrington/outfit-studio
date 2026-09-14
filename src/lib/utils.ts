export { cn } from "cn"

/** Title-cases each word: "colorblock" -> "Colorblock", "dobby dot" -> "Dobby Dot". */
export function capitalize(value: string): string {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
}

/** Formats an ISO date string as e.g. "Sep 13, 2026". */
export function formatSavedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
