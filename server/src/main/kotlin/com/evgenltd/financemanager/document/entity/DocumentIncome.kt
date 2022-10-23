package com.evgenltd.financemanager.document.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("document")
class DocumentIncome(
        id: String?,
        date: LocalDate,
        description: String,
        var amount: Amount,
        var account: String,
        var incomeCategory: String
) : Document(id, date, description) {
    
    fun toRecord(): DocumentIncomeRecord = DocumentIncomeRecord(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            incomeCategory = incomeCategory
    )
    
}