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
      true: 'items-center justify-center',
    },
    gap: {
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
    },
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    center: false,
    gap: 2,
    scrollable: false,
  },
})

export function Stack({ orientation, center, gap, scrollable, className, children }: StackProps) {
  return (
    <div className={cn(variants({ orientation, center, gap, scrollable }), className)}>
      {children}
    </div>
  )
}
