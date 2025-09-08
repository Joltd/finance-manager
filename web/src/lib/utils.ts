import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addDays, format, isAfter, parse } from 'date-fns'
import { RangeValue } from '@/types/common'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function jsonAsBlob(data: any): Blob {
  return new Blob([JSON.stringify(data)], { type: 'application/json' })
}

export function flatten(
  data: any,
  prefix: string = '',
  res: Record<string, any> = {},
): Record<string, any> {
  for (const key of Object.keys(data)) {
    const value = data[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    if (!!value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, newKey, res)
    } else {
      res[newKey] = value
    }
  }
  return res
}

export const fillPathParams = (path: string, pathParams?: Record<string, any>): string => {
  if (!pathParams) {
    return path
  }

  Object.keys(pathParams).forEach((key) => {
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

// export function prepareRange(from?: Date, to?: Date): RangeValue<string | undefined> {
//   if (!from || !to) {
//     return {
//       from: formatDate(from),
//       to: formatDate(to),
//     }
//   }
//
//   let actualFrom = from
//   let actualTo = to
//
//   if (isAfter(to, from)) {
//     // ignore
//   } else if (isAfter(from, to)) {
//     actualFrom = to
//     actualTo = from
//   } else {
//     actualFrom = from
//     actualTo = addDays(from, 1)
//   }
//
//   return {
//     from: formatDate(actualFrom),
//     to: formatDate(actualTo),
//   }
// }
