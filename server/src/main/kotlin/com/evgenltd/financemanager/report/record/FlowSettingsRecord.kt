package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowSettingsRecord(
        val dateFrom: LocalDate,
        val dateTo: LocalDate,
        val expenseCategories: List<String>,
        val incomeCategories: List<String>,
        val currency: String,
        val groupBy: String
)