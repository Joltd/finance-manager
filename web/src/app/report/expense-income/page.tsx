import { TextLabel } from '@/components/common/text-label'
import React from 'react'
import { TransactionReportFilter } from '@/components/report/transaction-report-filter'

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-hidden">
      <TextLabel variant="title" className="grow">
        Expense vs income
      </TextLabel>
      <TransactionReportFilter />
    </div>
  )
}
