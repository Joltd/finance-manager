import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, LabelList, XAxis } from 'recharts'
import { format } from 'date-fns'
import * as React from 'react'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { CategoryEntry } from '@/types/report'

export interface CategoryChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: CategoryEntry[]
}

export function CategoryChart({ data, ...props }: CategoryChartProps) {
  return (
    <ChartContainer config={{}} {...props}>
      <BarChart data={data}>
        <XAxis dataKey={(it) => it.account.name} axisLine={false} tickLine={false} tickSize={10} />
        <Bar dataKey={(it) => it.amount.value} radius={4} fill="var(--chart-1)" />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, item, index, payload) => (
                <div className="flex">
                  {(payload as any).account.name}
                  <span>&nbsp;-&nbsp;</span>
                  <AmountLabel shorten amount={(payload as any).amount} />
                </div>
              )}
            />
          }
        />
      </BarChart>
    </ChartContainer>
  )
}
