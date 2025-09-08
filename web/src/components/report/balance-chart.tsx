import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Label, Pie, PieChart } from 'recharts'
import { AmountLabel } from '@/components/common/amount-label'
import { BalanceEntry } from '@/types/report'
import { useMemo } from 'react'
import * as React from 'react'
import { amount, plus } from '@/types/common/amount'

export interface BalanceChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: BalanceEntry[]
}

export function BalanceChart({ data, ...props }: BalanceChartProps) {
  const actualData = useMemo(() => {
    return data.map((it, index) => ({
      ...it,
      name: it.group?.id || 'empty',
      value: it.amount.value,
      fill: index < data.length - 1 ? `var(--chart-${index + 1})` : `var(--secondary)`,
    }))
  }, [data])

  const total = useMemo(() => {
    if (!data.length) {
      return
    }
    return data.map((it) => it.amount).reduce((acc, it) => plus(acc, it)!!)
  }, [data])

  return (
    <ChartContainer config={{}} {...props}>
      <PieChart>
        <Pie
          data={actualData}
          nameKey="name"
          dataKey="value"
          startAngle={90}
          endAngle={90 + 360}
          innerRadius={70}
          fill="var(--chart-1)"
        >
          <Label
            content={({ viewBox }) => (
              <foreignObject
                x={(viewBox as any).cx - 60}
                y={(viewBox as any).cy - 10}
                width={120}
                height={20}
              >
                <div className="flex items-center justify-center w-fill h-full">
                  <AmountLabel shorten amount={total} />
                </div>
              </foreignObject>
            )}
          />
        </Pie>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, item, payload) => (
                <div className="flex">
                  {item.payload.group?.name || 'Other'}
                  <span>&nbsp;-&nbsp;</span>
                  <AmountLabel shorten amount={item.payload.amount} />
                </div>
              )}
            />
          }
        />
      </PieChart>
    </ChartContainer>
  )
}
