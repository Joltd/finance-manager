'use client'
import { useDashboardStore } from '@/store/report'
import { useEffect } from 'react'
import { Layout } from '@/components/common/layout/layout'
import { BalanceChart } from '@/components/report/balance-chart'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { TopFlowChart } from '@/components/report/top-flow-chart'
import { IncomeExpenseChart } from '@/components/report/income-expense-chart'
import { Stack } from '@/components/common/layout/stack'
import { OperationLabel } from '@/components/common/typography/operation-label'
import { Section } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { ListIcon, PlusIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Page() {
  const isMobile = useIsMobile()
  const dashboard = useDashboardStore('fetch', 'data', 'loading', 'dataFetched', 'error')

  useEffect(() => {
    dashboard.fetch()
  }, [])

  const handleViewAllOperations = () => {}

  return (
    <Layout scrollable>
      <DataPlaceholder {...dashboard}>
        <Section
          text="Operations"
          actions={
            <>
              <ResponsiveButton
                size="sm"
                label="Add"
                icon={<PlusIcon />}
                onClick={handleViewAllOperations}
              />
              <ResponsiveButton
                size="sm"
                variant="outline"
                label="View all"
                icon={<ListIcon />}
                onClick={handleViewAllOperations}
              />
            </>
          }
        >
          <Stack>
            {dashboard.data?.operations?.map((it) => (
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
          </Stack>
        </Section>

        <Section text="Charts">
          <Stack orientation={isMobile ? 'vertical' : 'horizontal'}>
            {dashboard.data?.balance && <BalanceChart data={dashboard.data.balance} />}
            {dashboard.data?.topExpenses && <TopFlowChart data={dashboard.data.topExpenses} />}
            {isMobile && <div className="h-6" />}
            {dashboard.data?.incomeExpense && (
              <IncomeExpenseChart data={dashboard.data.incomeExpense} />
            )}
          </Stack>
        </Section>
      </DataPlaceholder>
    </Layout>
  )
}
