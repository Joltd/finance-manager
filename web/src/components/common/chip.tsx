import * as React from 'react'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Shorten } from '@/components/common/shorten'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  onDismiss?: () => void
  icon?: React.ReactNode
}

export function Chip({ text, onDismiss, icon, ...props }: ChipProps) {
  return (
    <Badge variant="outline" className={cn('p-0', props.className)} {...props}>
      <div className="pl-3 max-w-30">
        <Shorten text={text} />
      </div>
      {onDismiss && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
        >
          {icon || <XIcon />}
        </Button>
      )}
    </Badge>
  )
}
