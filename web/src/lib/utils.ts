import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function jsonAsBlob(data: any): Blob {
  return new Blob(
    [JSON.stringify(data)],
    { type: "application/json" }
  )
}