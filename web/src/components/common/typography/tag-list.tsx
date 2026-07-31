import { Tag } from '@/types/tag'
import { cn } from '@/lib/utils'
import { Stack } from '@/components/common/layout/stack'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

interface TagListProps {
  tags: Tag[]
  maxVisible?: number
  className?: string
}

export function TagList({ tags, maxVisible = 2, className }: TagListProps) {
  if (tags.length === 0) return null
  const hidden = tags.length - maxVisible

  return (
    <Stack orientation="horizontal" align="center" gap={1} className={cn('shrink-0', className)}>
      {tags.slice(0, maxVisible).map((tag) => (
        <Badge key={tag.id ?? tag.name} variant="secondary">
          {tag.name}
        </Badge>
      ))}
      {hidden > 0 && (
        <HoverCard openDelay={150}>
          <HoverCardTrigger asChild>
            <Badge variant="outline" className="cursor-default">
              +{hidden}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit max-h-60 overflow-y-auto">
            <Stack orientation="vertical" gap={1}>
              {tags.map((tag) => (
                <Badge key={tag.id ?? tag.name} variant="secondary" className="w-fit">
                  {tag.name}
                </Badge>
              ))}
            </Stack>
          </HoverCardContent>
        </HoverCard>
      )}
    </Stack>
  )
}
