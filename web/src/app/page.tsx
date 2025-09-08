'use client'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationLabel } from '@/components/common/operation-label'
import { TextLabel } from '@/components/common/text-label'
import { AccountBalanceCard } from '@/components/account/account-balance-card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, PieChart } from 'recharts'
import { useDashboardStore } from '@/store/report'
import { DataSection } from '@/components/common/data-section'
import { useEffect, useMemo } from 'react'
import { AmountLabel } from '@/components/common/amount-label'
import { TopFlowChart } from '@/components/report/top-flow-chart'
import { amount } from '@/types/common/amount'
import { CategoryEntry, ExpenseIncomeEntry, TopFlowEntry } from '@/types/report'
import { entertainmentExpense, foodExpense, transportExpense, utilityExpense } from '@/types/stub'
import { ExpenseIncomeChart } from '@/components/report/expense-income-chart'
import { CategoryChart } from '@/components/report/category-chart'
import { BalanceChart } from '@/components/report/balance-chart'

export default function Page() {
  const dashboard = useDashboardStore('fetch', 'data', 'loading', 'dataFetched', 'error')

  useEffect(() => {
    dashboard.fetch()
  }, [])

  const categoryData: CategoryEntry[] = [
    { account: entertainmentExpense as any, amount: amount(500, 'USD') },
    { account: utilityExpense as any, amount: amount(300, 'USD') },
    { account: transportExpense as any, amount: amount(200, 'USD') },
    { account: foodExpense as any, amount: amount(80, 'USD') },
  ]

  const topFlowData: TopFlowEntry[] = [
    // {
    //   date: '2025-01-01',
    //   category1: amount(2500, 'USD'),
    //   category2: amount(1700, 'USD'),
    //   category3: amount(900, 'USD'),
    //   other: amount(4000, 'USD'),
    // },
    // {
    //   date: '2025-02-01',
    //   category1: amount(2300, 'USD'),
    //   category2: amount(1900, 'USD'),
    //   category3: amount(850, 'USD'),
    //   other: amount(3800, 'USD'),
    // },
    {
      date: '2025-03-01',
      category1: { account: foodExpense as any, amount: amount(2800, 'USD') },
      category2: { account: transportExpense as any, amount: amount(1600, 'USD') },
      category3: { account: entertainmentExpense as any, amount: amount(950, 'USD') },
      other: { amount: amount(4200, 'USD') },
    },
    {
      date: '2025-04-01',
      category1: { account: entertainmentExpense as any, amount: amount(2400, 'USD') },
      category2: { account: utilityExpense as any, amount: amount(1850, 'USD') },
      category3: { account: transportExpense as any, amount: amount(800, 'USD') },
      other: { amount: amount(3900, 'USD') },
    },
    {
      date: '2025-05-01',
      category1: { account: foodExpense as any, amount: amount(2600, 'USD') },
      category2: { account: entertainmentExpense as any, amount: amount(1750, 'USD') },
      category3: { account: utilityExpense as any, amount: amount(920, 'USD') },
      other: { amount: amount(4100, 'USD') },
    },
  ]

  const expenseIncomeData: ExpenseIncomeEntry[] = [
    { date: '2025-03-01', expense: amount(3000, 'USD'), income: amount(8000, 'USD') },
    { date: '2025-04-01', expense: amount(2500, 'USD'), income: amount(7800, 'USD') },
    { date: '2025-05-01', expense: amount(2200, 'USD'), income: amount(8200, 'USD') },
    { date: '2025-06-01', expense: amount(2800, 'USD'), income: amount(6500, 'USD') },
  ]

  return (
    <DataSection store={dashboard}>
      <div className="flex flex-col gap-12 p-6 min-h-full overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <TextLabel variant="title" className="grow">
              Accounts
            </TextLabel>
            <Button variant="secondary">View all</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            {dashboard.data?.accountBalances?.map((it) => (
              <AccountBalanceCard key={it.account.id} account={it.account} balances={it.balances} />
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
            {dashboard.data?.operations.map((it) => (
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
        <div className="grid grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <TextLabel variant="title">Group balances</TextLabel>
            <BalanceChart data={dashboard.data?.groupBalances || []} className="h-[250px]" />
          </div>

          <div className="flex flex-col gap-4">
            <TextLabel variant="title">Top expenses</TextLabel>
            <TopFlowChart data={topFlowData} className="h-[250px]" />
          </div>

          <div className="flex flex-col gap-4">
            <TextLabel variant="title">Income and expenses</TextLabel>
            <ExpenseIncomeChart data={expenseIncomeData} className="h-[250px]" />
          </div>
        </div>
      </div>
    </DataSection>
  )
}
