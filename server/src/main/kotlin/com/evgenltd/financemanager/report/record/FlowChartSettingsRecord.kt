package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class FlowChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val type: Direction?,
    val categories: List<String>,
    val commonCurrency: String
)