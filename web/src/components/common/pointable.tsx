import React from 'react'
import { cn } from '@/lib/utils'

export interface PointableProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  disabled?: boolean
}

export const Pointable = React.forwardRef<HTMLDivElement, PointableProps>(
  ({ selected, disabled, className, ...props }: PointableProps, ref) => (
    <div
      ref={ref}
      onClick={!disabled ? props.onClick : undefined}
      className={cn(
        'select-none',
        !disabled && 'hover:bg-accent dark:hover:bg-accent/50 hover:rounded-sm ',
        selected && 'outline-2 outline-dotted outline-accent-foreground rounded-sm',
        className,
      )}
      {...props}
    >
      {props.children}
    </div>
  ),
)
