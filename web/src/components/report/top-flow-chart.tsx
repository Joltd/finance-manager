import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, LabelList, XAxis } from 'recharts'
import { TopFlowEntry } from '@/types/report'
import { format } from 'date-fns'
import * as React from 'react'
import { AccountLabel } from '@/components/common/account-label'
import { AmountLabel } from '@/components/common/amount-label'

export interface TopFlowChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TopFlowEntry[]
}

export function TopFlowChart({ data, ...props }: TopFlowChartProps) {
  const handleClick = (type: string, data: TopFlowEntry) => {
    console.log(type, data)
  }

  return (
    <ChartContainer config={{}} {...props}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tickSize={10}
          tickFormatter={(value) => format(value, 'MMM yyyy')}
        />
        <Bar
          dataKey={(it) => it.category1.amount.value}
          radius={4}
          fill="var(--chart-1)"
          onClick={(data) => handleClick('category1', data)}
        />
        <Bar
          dataKey={(it) => it.category2.amount.value}
          radius={4}
          fill="var(--chart-2)"
          onClick={(data) => handleClick('category2', data)}
        />
        <Bar
          dataKey={(it) => it.category3.amount.value}
          radius={4}
          fill="var(--chart-3)"
          onClick={(data) => handleClick('category3', data)}
        />
        <Bar
          dataKey={(it) => it.other.amount.value}
          radius={4}
          fill="var(--secondary)"
          onClick={(data) => handleClick('other', data)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => <div>{format(label, 'MMM yyyy')}</div>}
              formatter={(value, name, item, index, payload) => {
                const fields = Object.keys(payload)
                const category = fields[index + 1]
                const entry = item.payload[category]
                return (
                  <div className="flex">
                    {entry?.account?.name || 'Other'}
                    <span>&nbsp;-&nbsp;</span>
                    <AmountLabel shorten amount={entry.amount} />
                  </div>
                )
              }}
            />
          }
        />
      </BarChart>
    </ChartContainer>
  )
}
