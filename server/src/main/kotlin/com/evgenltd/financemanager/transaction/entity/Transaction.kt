package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

@Document("transactions")
abstract class Transaction(
        @Id
        var id: String?,
        var date: LocalDate,
        var direction: Direction,
        var amount: Amount,
        var document: String
)

enum class Direction { IN, OUT }

@Document("transactions")
class AccountTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var account: String
) : Transaction(id, date, direction, amount, document)

@Document("transactions")
class ExpenseTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var expenseCategory: String
) : Transaction(id, date, direction, amount, document)

@Document("transactions")
class IncomeTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var incomeCategory: String
) : Transaction(id, date, direction, amount, document)

@Document("transactions")
class PersonTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String,
        var person: String
) : Transaction(id, date, direction, amount, document)

@Document("transactions")
class ExchangeTransaction(
        id: String?,
        date: LocalDate,
        direction: Direction,
        amount: Amount,
        document: String
) : Transaction(id, date, direction, amount, document)