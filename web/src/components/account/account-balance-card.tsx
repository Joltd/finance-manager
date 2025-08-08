import { Amount } from '@/types/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AmountLabel } from '@/components/common/amount-label'
import { EmptyLabel } from '@/components/common/empty-label'
import { Shorten } from '@/components/common/shorten'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'

export interface AccountBalanceCardProps {
  id: string
  name: string
  balances: Amount[]
  onClick?: () => void
}

const maxItems = 3

export function AccountBalanceCard({ id, name, balances, onClick }: AccountBalanceCardProps) {
  const visibleItems = balances.length > maxItems ? maxItems - 1 : maxItems

  return (
    <Card className="w-60" onClick={onClick}>
      <CardHeader>
        <CardTitle className="truncate">
          <Shorten text={name} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!balances.length ? (
          <EmptyLabel />
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
