import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'

export interface ShortenProps {
  text: string
}

export function Shorten({ text }: ShortenProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="truncate">{text}</div>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
