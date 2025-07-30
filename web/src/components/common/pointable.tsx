import React, { MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export interface PointableProps {
  selected?: boolean
  onClick?: (event: MouseEvent) => void
  className?: string
  children: React.ReactNode
}

export function Pointable({ selected, onClick, className, children }: PointableProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'hover:bg-muted hover:rounded-sm select-none',
        selected && 'outline-2 outline-dotted outline-accent-foreground rounded-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
