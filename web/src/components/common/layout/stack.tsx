import React, { RefAttributes } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants>,
    RefAttributes<HTMLDivElement> {}

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

export function Stack({
  orientation,
  center,
  gap,
  scrollable,
  className,
  children,
  ...props
}: StackProps) {
  return (
    !!React.Children.toArray(children).length && (
      <div className={cn(variants({ orientation, center, gap, scrollable }), className)} {...props}>
        {children}
      </div>
    )
  )
}
