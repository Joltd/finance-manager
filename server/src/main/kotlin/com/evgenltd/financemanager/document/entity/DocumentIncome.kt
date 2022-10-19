package com.evgenltd.financemanager.document.entity

import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("documents")
class DocumentIncome(
        id: String?,
        date: LocalDate,
        description: String,
        var account: String,
        var incomeCategory: String
) : Document(id, date, description)