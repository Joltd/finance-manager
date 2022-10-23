package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

class DocumentIncomeRecord(
        val id: String?,
        val date: LocalDate,
        val description: String,
        val amount: Amount,
        val account: String,
        val incomeCategory: String
) : DocumentRecord