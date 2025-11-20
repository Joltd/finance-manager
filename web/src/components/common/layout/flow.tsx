import React, { RefAttributes } from 'react'
import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

export interface FlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants>,
    RefAttributes<HTMLDivElement> {}

const variants = cva('flex flex-wrap', {
  variants: {
    gap: {
      2: 'gap-2',
      4: 'gap-4',
    },
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  defaultVariants: {
    gap: 2,
    scrollable: false,
  },
})

export function Flow({ gap, scrollable, className, children, ...props }: FlowProps) {
  return (
    !!React.Children.toArray(children).length && (
      <div className={cn(variants({ gap, scrollable }), className)} {...props}>
        {children}
      </div>
    )
  )
}
