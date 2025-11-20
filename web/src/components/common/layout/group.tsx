import React, { RefAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/common/typography/typography'

export interface GroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    RefAttributes<HTMLDivElement> {
  text?: string | React.ReactNode
}

export function Group({ text, className, children, ...props }: GroupProps) {
  return (
    <div className={cn('flex flex-col md:gap-2 gap-2 w-full', className)} {...props}>
      {text && (typeof text === 'string' ? <Typography variant="h4">{text}</Typography> : text)}
      {children}
    </div>
  )
}
