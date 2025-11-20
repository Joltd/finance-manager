import { AmountLabel, AmountLabelNew } from '@/components/common/typography/amount-label'
import { BalanceAccountEntry, BalanceChartData, BalanceGroupEntry } from '@/types/report'
import { useMemo, useState } from 'react'
import * as React from 'react'
import { plus } from '@/types/common/amount'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { VerticalBarChart } from '@/components/common/chart/vertical-bar-chart'
import { RingChart } from '@/components/common/chart/ring-chart'

export interface BalanceChartProps {
  data: BalanceChartData
}

export function BalanceChart({ data }: BalanceChartProps) {
  const [accountView, setAccountView] = useState(false)
  const [otherView, setOtherView] = useState(false)
  const [group, setGroup] = useState<BalanceGroupEntry | undefined>()

  const handleGroupClick = (data: any) => {
    if (data.other) {
      setOtherView(true)
    } else {
      handleAccountClick(data)
    }
  }

  const handleAccountClick = (data: any) => {
    setGroup(data)
    setAccountView(true)
  }

  const handleBack = () => {
    if (accountView) {
      setAccountView(false)
    } else if (otherView) {
      setOtherView(false)
    }
  }

  return (
    <Stack>
      <Stack orientation="horizontal" className="items-center">
        {(otherView || accountView) && (
          <Button variant="ghost" size="icon-sm" onClick={handleBack}>
            <ArrowLeftIcon />
          </Button>
        )}
        <Typography variant="lead">
          {accountView ? group?.group?.name : otherView ? 'Other groups' : 'Balances'}
        </Typography>
        {accountView && group && <AmountLabel shorten amount={group?.amount} />}
      </Stack>
      {accountView && group ? (
        <AccountChart data={group.entries} />
      ) : otherView ? (
        <OtherGroupChart data={data.otherGroups} onBarClick={handleAccountClick} />
      ) : (
        <GroupChart data={data.groups} onSegmentClick={handleGroupClick} />
      )}
    </Stack>
  )
}

interface GroupChartProps {
  data: BalanceGroupEntry[]
  onSegmentClick: (data: BalanceGroupEntry) => void
}

function GroupChart({ data, onSegmentClick }: GroupChartProps) {
  const total = useMemo(
    () => data?.map((it) => it.amount)?.reduce((acc, it) => plus(acc, it)!!),
    [data],
  )

  return (
    <RingChart
      data={data}
      resolveId={(entry) => entry.group?.id || 'other'}
      resolveSegmentSize={(entry) => entry.amount.value}
      renderName={(entry) => <Typography>{entry.group?.name || 'No group'}</Typography>}
      renderValue={(entry) => <AmountLabelNew shorten amount={entry.amount} />}
      renderAccentValue={() => (
        <AmountLabelNew amount={total} shorten as="tspan" className="fill-foreground" />
      )}
      onSegmentClick={onSegmentClick}
    />
  )
}

interface OtherGroupChartProps {
  data: BalanceGroupEntry[]
  onBarClick: (data: any) => void
}

function OtherGroupChart({ data, onBarClick }: OtherGroupChartProps) {
  return (
    <VerticalBarChart
      data={data}
      resolveId={(entry) => entry.group?.id || '0'}
      resolveBarSize={(entry) => entry.amount.value}
      renderName={(entry, as) => <Typography as={as}>{entry.group?.name || 'No group'}</Typography>}
      renderValue={(entry, as) => <AmountLabelNew shorten amount={entry.amount} as={as} />}
      onBarClick={onBarClick}
    />
  )
}

interface AccountChartProps {
  data: BalanceAccountEntry[]
  onBarClick?: (data: BalanceAccountEntry) => void
}

function AccountChart({ data, onBarClick }: AccountChartProps) {
  return (
    <VerticalBarChart
      data={data}
      resolveId={(entry) => entry.account.id}
      resolveBarSize={(entry) => entry.amount.value}
      renderName={(entry, as) => <Typography as={as}>{entry.account.name}</Typography>}
      renderValue={(entry, as) => <AmountLabelNew shorten amount={entry.amount} as={as} />}
      onBarClick={onBarClick}
    />
  )
}
