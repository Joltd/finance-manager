import { CheckCheck, TriangleAlert } from 'lucide-react'

export interface ValidityIconProps {
  valid?: boolean | null
  collapseIfEmpty?: boolean
}

export function ValidityIcon({ valid, collapseIfEmpty }: ValidityIconProps) {
  return valid === null || valid === undefined ? (
    !collapseIfEmpty && <div className="shrink-0 w-6" />
  ) : valid ? (
    <CheckCheck className="shrink-0 text-green-500" />
  ) : (
    <TriangleAlert className="shrink-0 text-yellow-500" />
  )
}
