import React, { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const stackVariants = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
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
    orientation: 'vertical',
    gap: 2,
  },
})

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ orientation, align, justify, gap, scrollable, className, children, ...props }, ref) => {
    if (!React.Children.toArray(children).length) return null
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ orientation, align, justify, gap, scrollable }), className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Stack.displayName = 'Stack'