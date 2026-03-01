import React, { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const layoutVariants = cva('flex flex-col gap-6 p-4 md:gap-12 md:p-6 overflow-y-hidden', {
  variants: {
    scrollable: {
      true: 'overflow-y-auto',
    },
  },
  defaultVariants: {
    scrollable: false,
  },
})

export interface LayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants> {}

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ scrollable, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(layoutVariants({ scrollable }), className)} {...props}>
      {children}
    </div>
  ),
)
Layout.displayName = 'Layout'