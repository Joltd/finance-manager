export function buildPath(template: string, params: Record<string, string> | undefined): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
    template,
  )
}