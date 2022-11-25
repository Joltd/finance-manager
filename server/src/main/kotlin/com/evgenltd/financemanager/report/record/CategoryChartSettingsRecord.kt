package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class CategoryChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val groupBy: String,
    val expenseCategories: List<String>,
    val incomeCategories: List<String>,
    val currency: String
)