package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.entity.DocumentIncome
import java.time.LocalDate

class DocumentIncomeRecord(
        val id: String?,
        val date: LocalDate,
        val description: String,
        val amount: Amount,
        val account: String,
        val incomeCategory: String
) : DocumentRecord {

    fun toEntity(): DocumentIncome = DocumentIncome(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            incomeCategory = incomeCategory
    )

}