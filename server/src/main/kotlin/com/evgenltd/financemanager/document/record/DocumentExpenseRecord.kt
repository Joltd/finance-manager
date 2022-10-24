package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.entity.DocumentExpense
import java.time.LocalDate

class DocumentExpenseRecord(
        val id: String?,
        val date: LocalDate,
        val description: String,
        val amount: Amount,
        val account: String,
        val expenseCategory: String
) : DocumentRecord {

    fun toEntity(): DocumentExpense = DocumentExpense(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            expenseCategory = expenseCategory
    )

}