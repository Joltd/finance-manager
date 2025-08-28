import { CheckCheck, TriangleAlert } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface ValidityIconProps {
  valid?: boolean | null
  message?: string
  keepMessage?: boolean
  collapseIfEmpty?: boolean
}

export function ValidityIcon({ valid, message, keepMessage, collapseIfEmpty }: ValidityIconProps) {
  if (valid === null || valid === undefined) {
    return !collapseIfEmpty && <div className="shrink-0 w-6" />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {valid ? (
          <CheckCheck className="shrink-0 text-green-500" />
        ) : (
          <TriangleAlert className="shrink-0 text-yellow-500" />
        )}
      </TooltipTrigger>
      {message && (!valid || keepMessage) && <TooltipContent>{message}</TooltipContent>}
    </Tooltip>
  )
}
