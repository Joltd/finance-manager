package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

@Document("transaction")
abstract class Transaction(
        @Id
        var id: String?,
        var date: LocalDate,
        var direction: Direction,
        var amount: Amount,
        var document: String
)

enum class Direction { IN, OUT }

@Document("transaction")
class AccountTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var account: String
) : Transaction(id, date, direction, amount, document)

@Document("transaction")
class ExpenseTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var expenseCategory: String
) : Transaction(id, date, direction, amount, document)

@Document("transaction")
class IncomeTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var incomeCategory: String
) : Transaction(id, date, direction, amount, document)

@Document("transaction")
class PersonTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var person: String
) : Transaction(id, date, direction, amount, document)

@Document("transaction")
class ExchangeTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String
) : Transaction(id, date, direction, amount, document)