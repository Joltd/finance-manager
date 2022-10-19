package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

class DocumentExpenseRecord(
        val id: String?,
        val date: LocalDate,
        val description: String,
        val amount: Amount,
        val account: String,
        val expenseCategory: String
)