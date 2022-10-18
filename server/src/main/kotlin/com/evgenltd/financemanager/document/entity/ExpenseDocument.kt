package com.evgenltd.financemanager.document.entity

import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("documents")
class ExpenseDocument(
        id: String?,
        date: LocalDate,
        description: String,
        var account: String,
        var expenseCategory: String
) : Document(id, date, description)