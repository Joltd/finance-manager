import React, { MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export interface PointableProps {
  selected?: boolean
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
  className?: string
  children: React.ReactNode
}

export function Pointable({ selected, disabled, onClick, className, children }: PointableProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'select-none',
        !disabled && 'hover:bg-muted hover:rounded-sm ',
        selected && 'outline-2 outline-dotted outline-accent-foreground rounded-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
