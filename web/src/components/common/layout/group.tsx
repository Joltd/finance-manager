import React, { forwardRef } from 'react'
import { PencilIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Stack } from '@/components/common/layout/stack'

interface GroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  icon?: React.ReactNode
  onEdit?: () => void
}

export const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ title, icon, onEdit, children, className, ...props }, ref) => (
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
        {icon}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover/group:opacity-100 transition-opacity shrink-0"
            onClick={onEdit}
          >
            <PencilIcon className="w-3! h-3!" />
          </Button>
        )}
        <Separator className="flex-1" />
      </Stack>
      {children}
    </Stack>
  ),
)
Group.displayName = 'Group'
