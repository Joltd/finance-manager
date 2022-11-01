package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowSettingsRecord(
        val type: String,
        val dateFrom: LocalDate,
        val dateTo: LocalDate,
        val currency: String,
        val groupBy: String
)