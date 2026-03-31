import { ArrowRight, ScrollText, Sparkles } from 'lucide-react'

import { OperationIcon } from '@/components/common/icon/operation-icon'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AccountReference } from '@/types/account'
import type { Amount } from '@/types/common/amount'
import type { OperationType } from '@/types/operation'
import type { SuggestionRating } from '@/types/import-data'
import { cn, formatDateCommon } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportEntryCardVariant = 'operation' | 'suggestion' | 'parsed'

export interface ImportEntryCardProps {
  // Core operation data
  type: OperationType
  amountFrom: Amount
  amountTo: Amount
  accountFrom?: AccountReference
  accountTo?: AccountReference
  description?: string

  // Extra display fields (used in suggestion panels)
  date?: string
  rating?: SuggestionRating

  /**
   * When provided, only the "counterpart" account (the one whose id differs
   * from mainAccountId) will be shown.  If both accounts are the main account
   * or neither matches, both are shown with an arrow.
   */
  mainAccountId?: string

  /** Visual style preset */
  variant?: ImportEntryCardVariant

  /** Clickable mode — used for suggestion cards in the sheet */
  active?: boolean
  /** Marks the suggestion the backend chose as best match */
  recommended?: boolean
  onClick?: () => void
  className?: string

  /** Raw source data from the parsed file row */
  raw?: string

  /** Icon button to show on the right edge of the card */
  action?: React.ReactNode
  /** When true the action strip is always visible; otherwise only on hover */
  showAction?: boolean
}

const ratingColor: Record<SuggestionRating, string> = {
  GOOD: 'text-green-600 dark:text-green-400',
  FAIR: 'text-yellow-600 dark:text-yellow-400',
  POOR: 'text-red-500 dark:text-red-400',
}

function resolveCounterpart(
  mainAccountId: string | undefined,
  accountFrom: AccountReference | undefined,
  accountTo: AccountReference | undefined,
): { single: AccountReference | undefined; showBoth: boolean } {
  if (!mainAccountId) {
    return { single: undefined, showBoth: true }
  }
  if (accountFrom?.id === mainAccountId) {
    return { single: accountTo, showBoth: false }
  }
  if (accountTo?.id === mainAccountId) {
    return { single: accountFrom, showBoth: false }
  }
  // Neither account matches — show both
  return { single: undefined, showBoth: true }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImportDataEntryCard({
  type,
  amountFrom,
  amountTo,
  accountFrom,
  accountTo,
  description,
  date,
  rating,
  raw,
  mainAccountId,
  variant = 'operation',
  active = false,
  recommended = false,
  onClick,
  className,
  action,
  showAction = false,
}: ImportEntryCardProps) {
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  const { single: counterpart, showBoth } = resolveCounterpart(
    mainAccountId,
    accountFrom,
    accountTo,
  )

  const isClickable = !!onClick

  const baseVariantClass =
    variant === 'suggestion'
      ? 'border border-dashed bg-background opacity-60'
      : 'border bg-muted/30'

  const interactiveClass = isClickable
    ? active
      ? 'border-primary bg-primary/5 cursor-pointer transition-colors select-none'
      : 'bg-background hover:bg-accent cursor-pointer transition-colors select-none'
    : ''

  return (
    <Stack
      gap={1}
      className={cn(
        'relative group/card overflow-hidden rounded-md p-2.5',
        isClickable ? interactiveClass : baseVariantClass,
        className,
      )}
      onClick={onClick}
    >
      {/* Account row */}
      <Stack orientation="horizontal" align="center" gap={2} className="min-w-0">
        <OperationIcon type={type} size={12} colored className="shrink-0" />

        {showBoth ? (
          <Stack orientation="horizontal" align="center" gap={1} className="min-w-0 flex-1">
            {accountFrom ? (
              <Typography as="span" variant="small" className="truncate">
                {accountFrom.name}
              </Typography>
            ) : (
              <Typography as="span" variant="muted" className="truncate text-xs italic">
                unknown
              </Typography>
            )}
            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            {accountTo ? (
              <Typography as="span" variant="small" className="truncate text-muted-foreground">
                {accountTo.name}
              </Typography>
            ) : (
              <Typography as="span" variant="muted" className="truncate text-xs italic">
                unknown
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography as="span" variant="small" className="truncate flex-1">
            {counterpart ? (
              counterpart.name
            ) : (
              <span className="italic text-muted-foreground">unknown</span>
            )}
          </Typography>
        )}

        {/* Raw source data indicator */}
        {raw && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default w-fit">
                <ScrollText className="size-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm font-mono text-xs whitespace-pre-wrap break-all">
              {raw}
            </TooltipContent>
          </Tooltip>
        )}
      </Stack>

      {/* Amounts */}
      <Flow align="center" gap={1}>
        <AmountLabel amount={amountFrom} />
        {showBothAmounts && <AmountLabel amount={amountTo} />}
      </Flow>

      {/* Date + rating + recommended (optional) */}
      {(date || rating || recommended) && (
        <Flow align="center" gap={2}>
          {date && (
            <Typography variant="muted" className="text-xs shrink-0">
              {formatDateCommon(date)}
            </Typography>
          )}
          {rating && (
            <Typography className={cn('text-xs font-medium shrink-0', ratingColor[rating])}>
              {rating}
            </Typography>
          )}
          {recommended && (
            <Typography
              as="span"
              variant="small"
              className="inline-flex items-center gap-0.5 text-xs text-primary shrink-0"
            >
              <Sparkles className="size-3" />
              Auto
            </Typography>
          )}
        </Flow>
      )}

      {/* Description */}
      {description && (
        <Typography variant="muted" className="truncate text-xs">
          {description}
        </Typography>
      )}

      {action && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-center w-9 bg-muted/80',
            !showAction && 'hidden group-hover/card:flex',
          )}
        >
          {action}
        </div>
      )}
    </Stack>
  )
}
