import React from 'react'
import { cn } from '@/lib/utils'

export interface EmptyLabelProps {
  children?: React.ReactNode
  className?: string
}

export function EmptyLabel({ children, className }: EmptyLabelProps) {
  return <div className={cn('text-muted', className)}>{children || 'No data'}</div>
}
