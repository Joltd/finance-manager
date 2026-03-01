import React, { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const flowVariants = cva('flex flex-wrap', {
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    },
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  defaultVariants: {
    gap: 2,
  },
})

export interface FlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flowVariants> {}

export const Flow = forwardRef<HTMLDivElement, FlowProps>(
  ({ align, gap, scrollable, className, children, ...props }, ref) => {
    if (!React.Children.toArray(children).length) return null
    return (
      <div
        ref={ref}
        className={cn(flowVariants({ align, gap, scrollable }), className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Flow.displayName = 'Flow'