import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface TextLabelProps {
  variant?: 'title'
  children: React.ReactNode
  className?: string
}

const variants = cva('', {
  variants: {
    variant: {
      title: 'text-3xl',
    },
  },
})

export function TextLabel({ variant, children, className }: TextLabelProps) {
  return (
    <div className={cn('flex items-center gap-2', variants({ variant }), className)}>
      {children}
    </div>
  )
}
