package com.evgenltd.financemanager.document.record

import java.time.LocalDate

class DocumentFilter(
        val page: Int = 0,
        val size: Int = 50,
        val dateFrom: LocalDate? = null,
        val dateTo: LocalDate? = null,
        val type: String? = null,
        val expenseCategories: List<String> = emptyList(),
        val incomeCategories: List<String> = emptyList(),
        val currency: String? = null,
        val account: String? = null
)