import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import * as clipboard from "clipboard-polyfill"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (str: string, limit: number = 2) => {
  if (!str) return ""

  return str.split(/\s/).reduce((response, word, index) => {
    if (index < limit) response += word.slice(0, 1)
    return response
  }, "")
}

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function copyText(text: string) {
  clipboard.writeText(text).then(
    () => toast.success("Copied"),
    () => console.log("Failed to copy!")
  )
}

export function toKebabCase(text: string, toLowerCase = false) {
  let result = text

  if (!text) return ""

  if (toLowerCase) result = result.toLowerCase()

  return result
    .replace(/[^a-zA-Z0-9-]+/g, "-") //* Replace any character that is not a-z, A-Z, 0-9, or dash with dash
    .replace(/-+/g, "-") //* Collapse multiple dashes
}
