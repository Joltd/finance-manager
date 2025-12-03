import React from 'react'
import { cn } from '@/lib/utils'

export interface HoverIconProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HoverIcon({ children, className, ...props }: HoverIconProps) {
  return (
    <div
      className={cn(
        className,
        'group relative',
        '[&>*]:transition-opacity [&>*]:duration-200',
        '[&>*:first-child]:group-hover:opacity-0',
        '[&>*:last-child]:absolute [&>*:last-child]:top-0 [&>*:last-child]:opacity-0 [&>*:last-child]:group-hover:opacity-100',
      )}
      {...props}
    >
      {children}
    </div>
  )
}
