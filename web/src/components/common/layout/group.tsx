import React, { forwardRef } from 'react'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/common/typography/typography'
import { cn } from '@/lib/utils'
import { Stack } from '@/components/common/layout/stack'

interface GroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  actions?: React.ReactNode
}

export const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ title, actions, children, className, ...props }, ref) => (
    <Stack ref={ref} className={cn('group/group', className)} {...props}>
      <Stack
        orientation="horizontal"
        align="center"
        gap={3}
        className="py-2 sticky top-0 bg-background z-10"
      >
        <Typography
          as="span"
          variant="small"
          className="uppercase tracking-widest whitespace-nowrap shrink-0"
        >
          {title}
        </Typography>
        {actions}
        <Separator className="flex-1" />
      </Stack>
      {children}
    </Stack>
  ),
)
Group.displayName = 'Group'
