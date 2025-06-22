import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, format, isAfter } from "date-fns";
import { RangeValue } from "@/types/common";

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

export function trim(value?: string, maxLength: number = 50): string | undefined {
  if (value && value.length > maxLength) {
    return value?.slice(0, maxLength) + '...'
  }

  return value
}

export function prepareRange(from?: Date, to?: Date): RangeValue<string | undefined> {
  if (!from || !to) {
    return {
      from: from ? format(from, 'yyyy-MM-dd') : undefined,
      to: to ? format(to, 'yyyy-MM-dd') : undefined
    }
  }

  let actualFrom = from
  let actualTo = to

  if (isAfter(to, from)) {
    // ignore
  } else if (isAfter(from, to)) {
    actualFrom = to
    actualTo = from
  } else {
    actualFrom = from
    actualTo = addDays(from, 1)
  }

  return {
    from: format(actualFrom, 'yyyy-MM-dd'),
    to: format(actualTo, 'yyyy-MM-dd'),
  }
}
