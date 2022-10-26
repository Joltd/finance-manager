package com.evgenltd.financemanager.document.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("document")
class DocumentExpense(
        id: String?,
        date: LocalDate,
        description: String,
        var amount: Amount,
        var account: String,
        var expenseCategory: String
) : Document(id, date, description)