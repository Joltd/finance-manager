import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface TextLabelProps {
  variant?: 'title'
  children: React.ReactNode
}

const variants = cva('', {
  variants: {
    variant: {
      title: 'text-3xl',
    },
  },
})

export function TextLabel({ variant, children }: TextLabelProps) {
  return <div className={cn('flex items-center gap-2', variants({ variant }))}>{children}</div>
}
