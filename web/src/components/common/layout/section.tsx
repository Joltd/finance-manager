import React, { RefAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/common/typography/typography'

export interface SectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    RefAttributes<HTMLDivElement> {
  text?: string | React.ReactNode
  description?: string | React.ReactNode
  actions?: React.ReactNode
}

export function Section({
  text,
  description,
  actions,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('flex flex-col md:gap-6 gap-4 w-full', className)} {...props}>
      <SectionHeader text={text} description={description} actions={actions} />
      {children}
    </section>
  )
}

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
  return (
    (text || description || actions) && (
      <div className={cn(className, 'flex gap-2')} {...props}>
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
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    )
  )
}
