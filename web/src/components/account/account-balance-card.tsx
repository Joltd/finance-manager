import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Shorten } from '@/components/common/typography/shorten'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AccountReference } from '@/types/account'
import { ValidityIcon } from '@/components/common/icon/validity-icon'
import { differenceInDays, parseISO } from 'date-fns'
import { Amount } from '@/types/common/amount'
import { formatDate } from '@/lib/date'
import { DataPlaceholder } from '@/components/common/data-placeholder'

export interface AccountBalanceCardProps {
  account: AccountReference
  balances: Amount[]
  onClick?: () => void
}

const maxItems = 3

export function AccountBalanceCard({ account, balances, onClick }: AccountBalanceCardProps) {
  const visibleItems = balances.length > maxItems ? maxItems - 1 : maxItems

  const reviseDate = account.reviseDate ? parseISO(account.reviseDate) : undefined
  const isRevised = reviseDate && differenceInDays(new Date(), reviseDate) < 7

  return (
    <Card className="w-60" onClick={onClick}>
      <CardHeader>
        <CardTitle className={cn('flex items-center truncate', account.deleted && 'line-through')}>
          <Shorten text={account.name} />
          <div className="grow" />
          <ValidityIcon valid={isRevised} keepMessage message={formatDate(reviseDate)} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataPlaceholder dataFetched data={balances}>
          {balances.slice(0, visibleItems).map((amount) => (
            <AmountLabel key={amount.currency} amount={amount} />
          ))}
          {balances.length > visibleItems && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link" className="p-0 w-full justify-start">
                  More...
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-60 p-6" sideOffset={-40}>
                {balances.slice(visibleItems).map((amount) => (
                  <AmountLabel key={amount.currency} amount={amount} />
                ))}
              </HoverCardContent>
            </HoverCard>
          )}
        </DataPlaceholder>
      </CardContent>
    </Card>
  )
}
