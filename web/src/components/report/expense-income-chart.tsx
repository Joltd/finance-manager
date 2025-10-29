import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis } from 'recharts'
import { ExpenseIncomeEntry } from '@/types/report'
import { format } from 'date-fns'
import * as React from 'react'
import { AmountLabel } from '@/components/common/typography/amount-label'

export interface ExpenseIncomeChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ExpenseIncomeEntry[]
}

export function ExpenseIncomeChart({ data, ...props }: ExpenseIncomeChartProps) {
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
        <Bar dataKey={(it) => it.expense.value} radius={4} fill="var(--chart-1)" />
        <Bar dataKey={(it) => it.income.value} radius={4} fill="var(--chart-2)" />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => <div>{format(label, 'MMM yyyy')}</div>}
              formatter={(value, name, item, index, payload) => {
                const fields = Object.keys(payload)
                const type = fields[index + 1]
                const amount = item.payload[type]
                return (
                  <div className="flex">
                    {index === 0 ? 'Expense' : 'Income'}
                    <span>&nbsp;-&nbsp;</span>
                    <AmountLabel shorten amount={amount} />
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
