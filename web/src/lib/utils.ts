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

export const fillPathParams = (path: string, pathParams?: Record<string, any>): string => {
  if (!pathParams) {
    return path
  }

  Object.keys(pathParams)
    .forEach((key) => {
      const value = pathParams?.[key]
      if (value) {
        path = path.replaceAll(`:${key}`, value)
      }
    })

  return path
}