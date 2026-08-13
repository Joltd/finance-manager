package com.evgenltd.financemanager.testsupport.fixture

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
import java.time.LocalDate
import java.util.UUID

fun expenseRecord(
    bankAccount: Account,
    expenseCategory: Account,
    date: LocalDate,
    valueUsd: Long,
    id: UUID? = null,
    description: String = "",
) = OperationRecord(
    id = id,
    date = date,
    type = OperationType.EXPENSE,
    amountFrom = Amount(valueUsd, "USD"),
    accountFrom = accountRecordOf(bankAccount),
    amountTo = Amount(valueUsd, "USD"),
    accountTo = accountRecordOf(expenseCategory),
    description = description,
)

fun incomeRecord(
    incomeCategory: Account,
    bankAccount: Account,
    date: LocalDate,
    valueUsd: Long,
    id: UUID? = null,
    description: String = "",
) = OperationRecord(
    id = id,
    date = date,
    type = OperationType.INCOME,
    amountFrom = Amount(valueUsd, "USD"),
    accountFrom = accountRecordOf(incomeCategory),
    amountTo = Amount(valueUsd, "USD"),
    accountTo = accountRecordOf(bankAccount),
    description = description,
)
