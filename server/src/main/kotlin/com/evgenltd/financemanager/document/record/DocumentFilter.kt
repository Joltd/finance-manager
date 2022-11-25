package com.evgenltd.financemanager.document.record

import java.time.LocalDate

class DocumentFilter(
        val page: Int = 0,
        val size: Int = 50,
        val dateFrom: LocalDate?,
        val dateTo: LocalDate?,
        val type: String?,
        val expenseCategories: List<String>,
        val incomeCategories: List<String>,
        val currency: String?,
        val account: String?
)