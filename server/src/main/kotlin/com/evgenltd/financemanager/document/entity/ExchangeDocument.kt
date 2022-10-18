package com.evgenltd.financemanager.document.entity

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("documents")
class ExchangeDocument(
        id: String?,
        date: LocalDate,
        description: String,
        var amount: Amount,
        var accountFrom: String,
        var accountTo: String,
        var commissionAmount: Amount,
        var commissionExpenseCategory: String
) : Document(id, date, description)