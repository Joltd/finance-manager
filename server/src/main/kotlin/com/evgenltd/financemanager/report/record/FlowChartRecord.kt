package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.TransactionType
import java.time.LocalDate
import java.util.UUID

data class FlowChartRecord(
    val entries: List<FlowChartEntryRecord>
)

data class FlowChartEntryRecord(
    val date: LocalDate,
    val type: TransactionType,
    val category: UUID,
    val amount: Amount,
    val commonAmount: Amount
)

