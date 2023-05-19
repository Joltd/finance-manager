package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val categories: List<String>,
    val commonCurrency: String
)