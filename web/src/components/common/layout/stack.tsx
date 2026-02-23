import React, { forwardRef, RefAttributes } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants> {}

const variants = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    center: {
      true: '',
    },
    gap: {
      0: 'gap-0',
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    },
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  compoundVariants: [
    {
      orientation: 'vertical',
      center: true,
      class: 'justify-center',
    },
    {
      orientation: 'horizontal',
      center: true,
      class: 'items-center',
    },
  ],
  defaultVariants: {
    orientation: 'vertical',
    center: false,
    gap: 2,
    scrollable: false,
  },
})

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ orientation, center, gap, scrollable, className, children, ...props }, ref) =>
    !!React.Children.toArray(children).length && (
      <div
        ref={ref}
        className={cn(variants({ orientation, center, gap, scrollable }), className)}
        {...props}
      >
        {children}
      </div>
    ),
)
