'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, ScaleIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon } from 'lucide-react'

import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toDisplayString } from '@/types/common/amount'
import type { Dashboard, DashboardMonthlyAvg, DashboardTopExpense } from '@/types/report'
import type { Operation } from '@/types/operation'
import { useDashboardStore } from '@/store/report'

export default function DashboardPage() {
  const store = useDashboardStore()

  useEffect(() => {
    void store.fetch()
  }, [store.fetch])

  return (
    <Layout scrollable>
      <Typography variant="h3">Dashboard</Typography>

      {store.loading || !store.data ? (
        <DashboardSkeleton />
      ) : (
        <DashboardContent data={store.data} />
      )}
    </Layout>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

function DashboardContent({ data }: { data: Dashboard }) {
  return (
    <>
      {/* Hero — total balance */}
      <Card className="bg-primary text-primary-foreground border-0 shadow-none">
        <CardContent className="pt-6">
          <Stack gap={1}>
            <Stack orientation="horizontal" align="center" gap={2}>
              <WalletIcon className="size-4 opacity-70" />
              <span className="text-sm text-primary-foreground/70">Total Balance</span>
            </Stack>
            <span className="text-3xl md:text-4xl font-semibold font-mono tabular-nums">
              {toDisplayString(data.totalBalance)}
            </span>
            <span className="text-sm text-primary-foreground/60">
              Across all accounts · default currency
            </span>
          </Stack>
        </CardContent>
      </Card>

      {/* Main grid — analytics left, state+activity right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ── Left: analytics ── */}
        <div className="flex flex-col gap-4">
          <MonthlyAvgCard avg={data.avgMonthly} />
          <TopExpensesCard items={data.topExpenses} />
        </div>

        {/* ── Right: recent activity ── */}
        <div className="flex flex-col gap-4">
          <RecentOpsCard ops={data.recentOperations} />
        </div>

      </div>
    </>
  )
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function MonthlyAvgCard({ avg }: { avg: DashboardMonthlyAvg }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Monthly Average</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">

          <Stack orientation="horizontal" align="center" justify="between" gap={2} className="py-2.5">
            <Stack orientation="horizontal" align="center" gap={2}>
              <TrendingUpIcon className="size-3.5 text-emerald-500 shrink-0" />
              <Typography as="span" variant="small">Income</Typography>
            </Stack>
            <AmountLabel amount={avg.income} variant="income" />
          </Stack>

          <Separator />

          <Stack orientation="horizontal" align="center" justify="between" gap={2} className="py-2.5">
            <Stack orientation="horizontal" align="center" gap={2}>
              <TrendingDownIcon className="size-3.5 text-destructive shrink-0" />
              <Typography as="span" variant="small">Expense</Typography>
            </Stack>
            <AmountLabel amount={avg.expense} variant="expense" />
          </Stack>

          <Separator />

          <Stack orientation="horizontal" align="center" justify="between" gap={2} className="py-2.5">
            <Stack orientation="horizontal" align="center" gap={2}>
              <ScaleIcon className="size-3.5 text-muted-foreground shrink-0" />
              <Typography as="span" variant="small">Net</Typography>
            </Stack>
            <AmountLabel amount={avg.net} variant="balance" />
          </Stack>

        </div>
      </CardContent>
    </Card>
  )
}

function TopExpensesCard({ items }: { items: DashboardTopExpense[] }) {
  const max = Math.max(...items.map(i => Math.abs(i.avg.value)), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top Expenses</CardTitle>
        <CardDescription>Avg per month · last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {items.length === 0 ? (
            <Typography variant="muted" className="py-3">No expense data</Typography>
          ) : items.map((item, i) => {
            const pct = max > 0 ? (Math.abs(item.avg.value) / max) * 100 : 0
            return (
              <React.Fragment key={item.expense.id}>
                {i > 0 && <Separator />}
                <div className="relative py-2.5">
                  <div
                    className="absolute inset-y-0 left-0 bg-destructive/10 pointer-events-none transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <Stack orientation="horizontal" align="center" justify="between" gap={2} className="relative">
                    <Typography as="span" variant="small">{item.expense.name}</Typography>
                    <AmountLabel amount={item.avg} variant="expense" />
                  </Stack>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentOpsCard({ ops }: { ops: Operation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Operations</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/operation">
              View all
              <ArrowRightIcon className="size-3" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {ops.length === 0 ? (
            <Typography variant="muted" className="py-3">No operations</Typography>
          ) : ops.map((op, i) => {
            const showBoth =
              op.amountFrom.value !== op.amountTo.value ||
              op.amountFrom.currency !== op.amountTo.currency
            return (
              <React.Fragment key={op.id ?? i}>
                {i > 0 && <Separator />}
                <Stack orientation="horizontal" align="center" gap={3} className="py-2.5">
                  <OperationIcon type={op.type} size={14} colored className="shrink-0" />
                  <Stack orientation="horizontal" align="center" justify="between" gap={2} className="flex-1 min-w-0">
                    <Stack orientation="horizontal" align="center" gap={1} className="min-w-0">
                      <Typography as="span" variant="small" className="truncate">
                        {op.accountFrom.name}
                      </Typography>
                      <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
                      <Typography as="span" variant="small" className="truncate text-muted-foreground">
                        {op.accountTo.name}
                      </Typography>
                    </Stack>
                    <Stack orientation="horizontal" align="center" gap={1} className="shrink-0">
                      <AmountLabel amount={op.amountFrom} />
                      {showBoth && <AmountLabel amount={op.amountTo} />}
                    </Stack>
                  </Stack>
                </Stack>
              </React.Fragment>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-4 w-28" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-4 w-36" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}