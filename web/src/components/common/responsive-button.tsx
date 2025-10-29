import { Button, buttonVariants } from '@/components/ui/button'
import React from 'react'
import type { VariantProps } from 'class-variance-authority'

export interface ResponsiveButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  label?: string
  icon?: React.ReactNode
}

export function ResponsiveButton({ label, icon, ...props }: ResponsiveButtonProps) {
  return (
    <Button {...props}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
