package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

abstract class Transaction(
        @Id
        var id: String?,
        var date: LocalDate,
        var direction: Direction,
        var amount: Amount
)

enum class Direction { IN, OUT }

@Document("transactions")
class AccountTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        var account: String
) : Transaction(id, date, direction, amount)