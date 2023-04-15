package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

class Transaction(
    var id: String?,
    var direction: Direction,
    var date: LocalDate,
    var amount: Amount,
    var document: String,
    var account: String,
    var incomeCategory: String? = null,
    var expenseCategory: String? = null,
)