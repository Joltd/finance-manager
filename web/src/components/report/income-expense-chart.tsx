import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { format } from 'date-fns'
import * as React from 'react'
import { IncomeExpenseGroup } from '@/types/report'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Typography } from '@/components/common/typography/typography'
import { useRouter } from 'next/navigation'

export interface IncomeExpenseChartProps {
  data: IncomeExpenseGroup[]
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/report/income-expense')
  }

  return (
    <Stack onClick={handleClick}>
      <Typography variant="lead">Income vs expense</Typography>
      <ResponsiveContainer minWidth={300} width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickSize={10}
            tickFormatter={(value) => format(value, 'MMM yyyy')}
          />
          <Bar dataKey={(it) => it.entries[0].amount.value} radius={4} fill="var(--chart-1)" />
          <Bar dataKey={(it) => it.entries[1].amount.value} radius={4} fill="var(--chart-2)" />
        </BarChart>
      </ResponsiveContainer>
      <Flow className="justify-center">
        <Stack orientation="horizontal" className="items-center">
          <div className="size-2 rounded-sm bg-chart-1" />
          <Typography variant="small">Income</Typography>
        </Stack>
        <Stack orientation="horizontal" className="items-center">
          <div className="size-2 rounded-sm bg-chart-2" />
          <Typography variant="small">Expense</Typography>
        </Stack>
      </Flow>
    </Stack>
  )
}
