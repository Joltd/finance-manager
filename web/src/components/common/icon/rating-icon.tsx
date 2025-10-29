import { ChevronsUpIcon, ChevronUpIcon, LucideProps, MinusIcon, SquircleIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SuggestionRating } from '@/types/import-data'
import { cn } from '@/lib/utils'

export interface RatingIconProps extends Omit<LucideProps, 'ref'> {
  rating?: SuggestionRating
  score?: number
  className?: string
}

export function RatingIcon({ rating, score, className, ...props }: RatingIconProps) {
  if (!rating) {
    return <SquircleIcon className={className} {...props} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {rating === SuggestionRating.GOOD ? (
          <ChevronsUpIcon className={cn('text-green-500 shrink-0', className)} {...props} />
        ) : rating === SuggestionRating.FAIR ? (
          <ChevronUpIcon className={cn('text-yellow-500 shrink-0', className)} {...props} />
        ) : (
          <MinusIcon className={cn('shrink-0', className)} {...props} />
        )}
      </TooltipTrigger>
      {score && <TooltipContent>{score}</TooltipContent>}
    </Tooltip>
  )
}
