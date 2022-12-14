package com.evgenltd.financemanager.document.entity

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("document")
class DocumentExchange(
        id: String?,
        date: LocalDate,
        description: String,
        var accountFrom: String,
        var amountFrom: Amount,
        var accountTo: String,
        var amountTo: Amount
) : Document(id, date, description)