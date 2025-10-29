import React, { RefAttributes } from 'react'
import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

export interface LayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants>,
    RefAttributes<HTMLDivElement> {}

const variants = cva('flex flex-col gap-12 p-6 overflow-y-hidden', {
  variants: {
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  defaultVariants: {
    scrollable: false,
  },
})

export function Layout({ scrollable, className, ...props }: LayoutProps) {
  return (
    <div className={cn(variants({ scrollable }), className)} {...props}>
      {props.children}
    </div>
  )
}
