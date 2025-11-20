import { Bar, BarChart, BarProps, ResponsiveContainer, XAxis } from 'recharts'
import { TopFlowEntry, TopFlowGroup } from '@/types/report'
import { format } from 'date-fns'
import * as React from 'react'
import { pipe, map, flatMap, filter, uniqueBy } from 'remeda'
import { useMemo } from 'react'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { Flow } from '@/components/common/layout/flow'
import { useRouter } from 'next/navigation'

export interface TopFlowChartProps {
  data: TopFlowGroup[]
}

export function TopFlowChart({ data }: TopFlowChartProps) {
  const router = useRouter()
  const accounts = useMemo(() => {
    return pipe(
      data,
      flatMap((it) => it.entries),
      map((it) => it.account),
      filter((it) => !!it),
      uniqueBy((it) => it.id),
      map((it, index) => ({
        ...it,
        color: `var(--chart-${index + 1})`,
      })),
    )
  }, [data])

  const getFill = (account: string) => {
    return accounts.find((it) => it.id === account)?.color || 'var(--secondary)'
  }

  const handleClick = () => {
    router.push('/report/top-flow')
  }

  return (
    <Stack orientation="vertical" onClick={handleClick}>
      <Typography variant="lead">Top expenses</Typography>
      <ResponsiveContainer minWidth={300} width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickSize={10}
            tickFormatter={(value) => format(value, 'MMM yyyy')}
          />
          <Bar
            dataKey={(it) => it.entries[0].amount.value}
            radius={4}
            shape={(props: BarProps) => (
              <CustomBar fillFn={(payload) => getFill(payload.entries[0].account.id)} {...props} />
            )}
          />
          <Bar
            dataKey={(it) => it.entries[1].amount.value}
            radius={4}
            shape={(props: BarProps) => (
              <CustomBar fillFn={(payload) => getFill(payload.entries[1].account.id)} {...props} />
            )}
          />
          <Bar
            dataKey={(it) => it.entries[2].amount.value}
            radius={4}
            shape={(props: BarProps) => (
              <CustomBar fillFn={(payload) => getFill(payload.entries[2].account.id)} {...props} />
            )}
          />
          <Bar
            dataKey={(it) => it.entries.filter((it: any) => !!it.other)?.[0].amount.value}
            radius={4}
            fill="var(--secondary)"
          />
        </BarChart>
      </ResponsiveContainer>
      <Flow className="justify-center">
        {accounts.map((it) => (
          <Stack key={it.id} orientation="horizontal" className="items-center">
            <div className="size-2 rounded-sm" style={{ backgroundColor: it.color }} />
            <Typography variant="small">{it.name}</Typography>
          </Stack>
        ))}
      </Flow>
    </Stack>
  )
}

interface CustomBarProps extends BarProps {
  fillFn: (payload: any) => string
}

function CustomBar({ x, y, width, height, radius, fillFn, ...props }: CustomBarProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={radius as any}
      ry={radius as any}
      fill={fillFn((props as any).payload)}
    />
  )
}
