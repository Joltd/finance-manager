import { cn } from '@/lib/utils'
import { Typography } from '@/components/common/typography/typography'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

interface DescriptionLabelProps {
  description?: string
  className?: string
}

export function DescriptionLabel({ description, className }: DescriptionLabelProps) {
  if (!description) return null

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <Typography
          as="span"
          variant="small"
          className={cn(
            'truncate text-slate-500 dark:text-slate-400 italic cursor-default font-normal',
            className,
          )}
        >
          {description}
        </Typography>
      </HoverCardTrigger>
      <HoverCardContent className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-sm">
        {description}
      </HoverCardContent>
    </HoverCard>
  )
}
