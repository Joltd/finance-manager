'use client'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationLabel } from '@/components/common/operation-label'
import { TextLabel } from '@/components/common/text-label'
import { AccountBalanceCard } from '@/components/account/account-balance-card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, PieChart } from 'recharts'
import { useDashboardStore } from '@/store/dashboard'
import { DataSection } from '@/components/common/data-section'
import { useEffect, useMemo } from 'react'
import { AmountLabel } from '@/components/common/amount-label'

export default function Page() {
  const dashboard = useDashboardStore('fetch', 'data', 'loading', 'dataFetched', 'error')

  useEffect(() => {
    dashboard.fetch()
  }, [])

  const groupBalancesData = useMemo(
    () =>
      dashboard.data?.groupBalances?.map((it, index) => ({
        ...it,
        name: it.group?.id || 'empty',
        value: it.amount.value,
        fill:
          index < (dashboard.data?.groupBalances?.length || 0) - 1
            ? `var(--chart-${index + 1})`
            : `var(--secondary)`,
      })) || [],
    [dashboard.data],
  )

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
              <AccountBalanceCard
                key={it.account.id}
                id={it.account.id}
                name={it.account.name}
                deleted={it.account.deleted}
                balances={it.amounts}
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
        <div className="flex gap-12">
          <div className="flex flex-col gap-4">
            <TextLabel variant="title">Group balances</TextLabel>
            <ChartContainer config={{}} className="w-[200px] min-h-[200px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => (
                        <div className="flex">
                          {props.payload.group?.name || 'Other'}
                          <span>&nbsp;-&nbsp;</span>
                          <AmountLabel shorten amount={props.payload.amount} />
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={groupBalancesData}
                  nameKey="name"
                  dataKey="value"
                  startAngle={90}
                  endAngle={90 + 360}
                  innerRadius={50}
                />
              </PieChart>
            </ChartContainer>
          </div>

          {/*<div className="flex flex-col gap-4">*/}
          {/*  <TextLabel variant="title">Top expenses</TextLabel>*/}
          {/*  <ChartContainer config={topExpensesConfig} className="w-[400px] min-h-[200px]">*/}
          {/*    <BarChart data={topExpensesData}>*/}
          {/*      <ChartTooltip content={<ChartTooltipContent />} />*/}
          {/*      <XAxis dataKey="date" tickLine={false} axisLine={false} />*/}
          {/*      <Bar dataKey="expense1" radius={4} fill="var(--chart-1)" />*/}
          {/*      <Bar dataKey="expense2" radius={4} fill="var(--chart-2)" />*/}
          {/*      <Bar dataKey="expense3" radius={4} fill="var(--chart-3)" />*/}
          {/*    </BarChart>*/}
          {/*  </ChartContainer>*/}
          {/*</div>*/}

          {/*<div className="flex flex-col gap-4">*/}
          {/*  <TextLabel variant="title">Income and expenses</TextLabel>*/}
          {/*  <ChartContainer config={incomeExpenseConfig} className="w-[400px] min-h-[200px]">*/}
          {/*    <BarChart layout="vertical" data={incomeExpenseData}>*/}
          {/*      <ChartTooltip content={<ChartTooltipContent />} />*/}
          {/*      <XAxis type="number" hide />*/}
          {/*      <YAxis type="category" dataKey="date" tickLine={false} axisLine={false} />*/}
          {/*      <Bar dataKey="income" radius={4} fill="var(--chart-2)" />*/}
          {/*      <Bar dataKey="expense" radius={4} fill="var(--chart-1)" />*/}
          {/*    </BarChart>*/}
          {/*  </ChartContainer>*/}
          {/*</div>*/}
        </div>
      </div>
    </DataSection>
  )
}
