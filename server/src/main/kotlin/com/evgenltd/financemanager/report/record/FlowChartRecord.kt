package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

data class FlowChartRecord(
    val entries: List<FlowChartEntryRecord>
)

data class FlowChartEntryRecord(
    val date: LocalDate,
    val type: Direction,
    val category: String,
    val account: String,
    val amount: Amount,
    val commonAmount: Amount
)

