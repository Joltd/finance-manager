package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

@Document("transaction")
class Transaction(
    @Id
    var id: String?,
    var direction: Direction,
    var date: LocalDate,
    var amount: Amount,
    var document: String,
    var account: String,
    var incomeCategory: String? = null,
    var expenseCategory: String? = null,
)