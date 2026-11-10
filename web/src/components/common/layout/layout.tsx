import React, { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const layoutVariants = cva('flex flex-col gap-6 p-4 md:gap-6 md:p-6 overflow-y-hidden', {
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
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof layoutVariants> {
  // `narrow` keeps the content in a centered phone-width column, for mobile-first pages
  width?: 'full' | 'narrow'
}

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ scrollable, width = 'full', className, children, ...props }, ref) => (
    <div ref={ref} className={cn(layoutVariants({ scrollable }), className)} {...props}>
      {width === 'narrow' ? (
        // The column is a separate element so the scroll container itself stays full-width
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">{children}</div>
      ) : (
        children
      )}
    </div>
  ),
)
Layout.displayName = 'Layout'
