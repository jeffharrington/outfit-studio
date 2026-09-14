export { cn } from "cn"

/** Title-cases each word: "colorblock" -> "Colorblock", "dobby dot" -> "Dobby Dot". */
export function capitalize(value: string): string {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
}
