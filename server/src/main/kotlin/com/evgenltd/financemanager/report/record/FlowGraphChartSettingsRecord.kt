package com.evgenltd.financemanager.report.record

import java.time.LocalDate

data class FlowGraphChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val currency: String
)