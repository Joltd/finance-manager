import { ChevronsUpIcon, ChevronUpIcon, MinusIcon, SquircleIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SuggestionRating } from '@/types/import-data'

export interface RatingIconProps {
  rating?: SuggestionRating
  score?: number
}

export function RatingIcon({ rating, score }: RatingIconProps) {
  if (!rating) {
    return <SquircleIcon />
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        {rating === SuggestionRating.GOOD ? (
          <ChevronsUpIcon className="text-green-500 shrink-0" />
        ) : rating === SuggestionRating.FAIR ? (
          <ChevronUpIcon className="text-yellow-500 shrink-0" />
        ) : (
          <MinusIcon className="shrink-0" />
        )}
      </TooltipTrigger>
      {score && <TooltipContent>{score}</TooltipContent>}
    </Tooltip>
  )
}
