import React, { forwardRef } from 'react'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/common/typography/typography'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  actions?: React.ReactNode
}

export const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ title, actions, children, className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props}>
      <div className="flex items-center gap-3 py-2 sticky top-0 bg-background z-10">
        {actions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Typography
                as="span"
                variant="small"
                className="uppercase tracking-widest whitespace-nowrap shrink-0 cursor-pointer"
              >
                {title}
              </Typography>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">{actions}</DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Typography
            as="span"
            variant="small"
            className="uppercase tracking-widest whitespace-nowrap shrink-0"
          >
            {title}
          </Typography>
        )}
        <Separator className="flex-1" />
      </div>
      {children}
    </div>
  ),
)
Group.displayName = 'Group'
