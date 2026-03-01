import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/common/typography/typography'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  text?: string | React.ReactNode
  description?: string | React.ReactNode
  actions?: React.ReactNode
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ text, description, actions, className, children, ...props }, ref) => (
    <section ref={ref} className={cn('flex flex-col gap-4 md:gap-6 w-full', className)} {...props}>
      <SectionHeader text={text} description={description} actions={actions} />
      {children}
    </section>
  ),
)
Section.displayName = 'Section'

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string | React.ReactNode
  description?: string | React.ReactNode
  actions?: React.ReactNode
}

export function SectionHeader({
  text,
  description,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  if (!text && !description && !actions) return null
  return (
    <div className={cn('flex items-start gap-2', className)} {...props}>
      {(text || description) && (
        <div className="flex flex-col gap-1 grow">
          {typeof text === 'string' ? <Typography variant="h2">{text}</Typography> : text}
          {typeof description === 'string' ? (
            <Typography variant="muted">{description}</Typography>
          ) : (
            description
          )}
        </div>
      )}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 pt-0.5">{actions}</div>
      )}
    </div>
  )
}