package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.operation.record.OperationRecord

data class DashboardRecord(
    val balance: BalanceChartRecord,
    val operations: List<OperationRecord>,
    val topExpenses: List<TopFlowGroupRecord>,
    val incomeExpense: List<IncomeExpenseGroupRecord>,
)
