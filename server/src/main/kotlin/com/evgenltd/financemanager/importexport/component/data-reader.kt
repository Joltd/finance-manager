package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.common.util.parseAmount
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord


fun readFinance(path: String): List<DocumentTypedRecord> = readCsv(path)
        .map { row ->
            val document = when (row["type"]) {
                "expense" -> DocumentExpenseRecord(
                        id = null,
                        date = row["date"].date("yyyy-MM-dd"),
                        description = row["description"],
                        amount = row["amount"].parseAmount(),
                        accountName = row["accountName"],
                        expenseCategoryName = row["expenseCategoryName"],
                        account = null,
                        expenseCategory = null
                )
                "income" -> DocumentIncomeRecord(
                        id = null,
                        date = row["date"].date("yyyy-MM-dd"),
                        description = row["description"],
                        amount = row["amount"].parseAmount(),
                        accountName = row["accountName"],
                        incomeCategoryName = row["incomeCategoryName"],
                        account = null,
                        incomeCategory = null
                )
                "exchange" -> DocumentExchangeRecord(
                        id = null,
                        date = row["date"].date("yyyy-MM-dd"),
                        description = row["description"],
                        accountFromName = row["accountFromName"],
                        amountFrom = row["amountFrom"].parseAmount(),
                        accountToName = row["accountToName"],
                        amountTo = row["amountTo"].parseAmount(),
                        accountFrom = null,
                        accountTo = null
                )
                else -> throw IllegalArgumentException("Unknown type ${row["type"]}")
            }

            DocumentTypedRecord(
                    row["type"],
                    document
            )
        }