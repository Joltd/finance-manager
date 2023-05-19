package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

data class FlowChartRecord(
    val entries: List<FlowChartEntryRecord>
)

data class FlowChartEntryRecord(
    val date: LocalDate,
    val type: String,
    val category: String,
    val account: String,
    val amount: Amount,
    val commonAmount: Amount
)

