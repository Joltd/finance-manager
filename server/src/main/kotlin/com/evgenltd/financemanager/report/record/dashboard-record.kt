package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.record.OperationRecord

data class DashboardRecord(
    val totalBalance: Amount,
    val avgMonthly: DashboardMonthlyAvgRecord,
    val topExpenses: List<DashboardTopExpenseRecord>,
    val recentOperations: List<OperationRecord>,
)

data class DashboardMonthlyAvgRecord(
    val income: Amount,
    val expense: Amount,
    val net: Amount,
)

data class DashboardTopExpenseRecord(
    val expense: Reference,
    val avg: Amount,
)