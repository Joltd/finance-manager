package com.evgenltd.financemanager.document.entity

import com.evgenltd.financemanager.document.record.DocumentRowRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import org.springframework.data.annotation.Id
import java.time.LocalDate
import org.springframework.data.mongodb.core.mapping.Document as Entity

@Entity("document")
abstract class Document(
        @Id
        var id: String?,
        var date: LocalDate,
        var description: String
) {

    private fun type(): String = when (this) {
        is DocumentExpense -> "expense"
        is DocumentIncome -> "income"
        is DocumentExchange -> "exchange"
        else -> throw IllegalStateException("Unknown document type ${this::class}")
    }

    fun toSimpleRecord(): DocumentRowRecord = DocumentRowRecord(
            type = type(),
            id = id!!,
            date = date,
            description = description
    )

    fun toTypedRecord(): DocumentTypedRecord = when (this) {
        is DocumentExpense -> DocumentTypedRecord(type(), toRecord())
        is DocumentIncome -> DocumentTypedRecord(type(), toRecord())
        is DocumentExchange -> DocumentTypedRecord(type(), toRecord())
        else -> throw IllegalStateException("Unknown document type ${this::class}")
    }

}

