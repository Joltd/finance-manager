import { cn } from '@/lib/utils'
import { AmountLabel } from '@/components/common/amount-label'
import { TriangleAlert } from 'lucide-react'
import { ImportDataEntryGroup, ImportDataTotal } from '@/types/import-data'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { plus } from '@/types/common/amount'

export interface ImportDataGroupHeaderProps {
  group: ImportDataEntryGroup
}

export function ImportDataGroupHeader({ group }: ImportDataGroupHeaderProps) {
  return !!group.totals?.length ? (
    <div className="flex flex-col bg-accent rounded-sm p-2">
      {group.totals.map((it, index) => (
        <ImportDataGroupRow key={index} total={it} />
      ))}
    </div>
  ) : null
}

export interface ImportDataGroupTotalProps {
  total: ImportDataTotal
}

export function ImportDataGroupRow({ total }: ImportDataGroupTotalProps) {
  const operationAndSuggested = plus(total.operation, total.suggested)

  return (
    <div className={cn('grid items-center grid-cols-[minmax(0,_1fr)_64px_minmax(0,_1fr)]')}>
      <div>
        <Tooltip>
          <TooltipTrigger>
            <AmountLabel amount={operationAndSuggested} />
          </TooltipTrigger>
          {operationAndSuggested && (
            <TooltipContent className="grid grid-cols-2 gap-2">
              {total.operation && (
                <>
                  <div>Operation</div>
                  <AmountLabel amount={total.operation} />
                </>
              )}
              {total.suggested && (
                <>
                  <div className="text-info">Suggested</div>
                  <AmountLabel amount={total.suggested} className="text-info" />
                </>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      {!total.valid ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <TriangleAlert className="text-yellow-500 justify-self-center" />
          </TooltipTrigger>
          <TooltipContent>
            Day total by import file doesn't matched to a day total in database with suggested
            records
          </TooltipContent>
        </Tooltip>
      ) : (
        <div />
      )}
      <AmountLabel amount={total.parsed} className="ml-6" />
    </div>
  )
}
