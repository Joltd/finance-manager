import React, { RefAttributes } from 'react'
import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

export interface FlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants>, RefAttributes<HTMLDivElement> {}

const variants = cva('flex flex-wrap', {
  variants: {
    gap: {
      2: 'gap-2',
      4: 'gap-4',
    },
  },
  defaultVariants: {
    gap: 2,
  },
})

export function Flow({ gap, className, children, ...props }: FlowProps) {
  return (
    <div className={cn(variants({ gap }), className)} {...props}>
      {children}
    </div>
  )
}
