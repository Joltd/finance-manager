'use client'
import { useBalanceStore } from '@/store/balance'
import { AccountLabel } from '@/components/common/account-label'
import { AmountLabel } from '@/components/common/amount-label'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { balanceEvents } from '@/api/balance'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { subscribeSse } from '@/lib/notification'
import { balances, operations } from '@/types/stub'
import { OperationLabel } from '@/components/common/operation-label'
import { TextLabel } from '@/components/common/text-label'
import { AccountBalanceCard } from '@/components/account/account-balance-card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from 'recharts'

export default function Home() {
  const balanceChartConfig = {}
  const balanceChartData = [
    { group: 'Group #1', value: 9500 },
    { group: 'Group #2', value: 11255 },
    { group: 'Group #3', value: 43221 },
    { group: 'Group #4', value: 23888 },
    { group: 'Other', value: 15000 },
  ]

  const topExpensesConfig = {}
  const topExpensesData = [
    { date: '2025-04-01', expense1: 15432, expense2: 28765, expense3: 42198 },
    { date: '2025-05-01', expense1: 8976, expense2: 35421, expense3: 19876 },
    { date: '2025-06-01', expense1: 27654, expense2: 12987, expense3: 45321 },
    { date: '2025-07-01', expense1: 31245, expense2: 23456, expense3: 16789 },
  ]

  const incomeExpenseConfig = {}
  const incomeExpenseData = [
    { date: '2025-04-01', income: 42198, expense: 35421 },
    { date: '2025-05-01', income: 28976, expense: 15432 },
    { date: '2025-06-01', income: 47654, expense: 22987 },
    { date: '2025-07-01', income: 31245, expense: 43456 },
  ]

  return (
    <div className="flex flex-col gap-12 p-6 min-h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <TextLabel variant="title" className="grow">
            Accounts
          </TextLabel>
          <Button variant="secondary">View all</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          {balances.map((it) => (
            <AccountBalanceCard
              key={it.id}
              id={it.id}
              name={it.name}
              deleted={it.deleted}
              balances={it.balances}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <TextLabel variant="title" className="grow">
            Operations
          </TextLabel>
          <Button variant="secondary">View all</Button>
          <Button>
            <PlusIcon />
            Add operation
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {operations.map((it) => (
            <OperationLabel
              key={it.id}
              date={it.date}
              type={it.type}
              accountFrom={it.accountFrom}
              amountFrom={it.amountFrom}
              accountTo={it.accountTo}
              amountTo={it.amountTo}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-12">
        <div className="flex flex-col gap-4">
          <TextLabel variant="title">Group balances</TextLabel>
          <ChartContainer config={balanceChartConfig} className="w-[400px] min-h-[200px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={balanceChartData}
                dataKey="value"
                nameKey="group"
                paddingAngle={5}
                innerRadius={60}
                label
              />
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col gap-4">
          <TextLabel variant="title">Top expenses</TextLabel>
          <ChartContainer config={topExpensesConfig} className="w-[400px] min-h-[200px]">
            <BarChart data={topExpensesData}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <Bar dataKey="expense1" radius={4} fill="var(--chart-1)" />
              <Bar dataKey="expense2" radius={4} fill="var(--chart-2)" />
              <Bar dataKey="expense3" radius={4} fill="var(--chart-3)" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col gap-4">
          <TextLabel variant="title">Income and expenses</TextLabel>
          <ChartContainer config={incomeExpenseConfig} className="w-[400px] min-h-[200px]">
            <BarChart layout="vertical" data={incomeExpenseData}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="date" tickLine={false} axisLine={false} />
              <Bar dataKey="income" radius={4} fill="var(--chart-2)" />
              <Bar dataKey="expense" radius={4} fill="var(--chart-1)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
