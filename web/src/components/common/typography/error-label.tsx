export interface ErrorLabelProps {
  error?: string | null
}

export function ErrorLabel({ error }: ErrorLabelProps) {
  return error && (
    <div className="text-red-400">{error}</div>
  )
}