package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.common.util.parseAmount
import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.entity.DocumentEntry
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import org.jsoup.Jsoup
import org.jsoup.nodes.Node
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths


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
                        account = "",
                        expenseCategory = ""
                )
                "income" -> DocumentIncomeRecord(
                        id = null,
                        date = row["date"].date("yyyy-MM-dd"),
                        description = row["description"],
                        amount = row["amount"].parseAmount(),
                        accountName = row["accountName"],
                        incomeCategoryName = row["incomeCategoryName"],
                        account = "",
                        incomeCategory = ""
                )
                "exchange" -> DocumentExchangeRecord(
                        id = null,
                        date = row["date"].date("yyyy-MM-dd"),
                        description = row["description"],
                        accountFromName = row["accountFromName"],
                        amountFrom = row["amountFrom"].parseAmount(),
                        accountToName = row["accountToName"],
                        amountTo = row["amountTo"].parseAmount(),
                        accountFrom = "",
                        accountTo = ""
                )
                else -> throw IllegalArgumentException("Unknown type ${row["type"]}")
            }

            DocumentTypedRecord(
                    row["type"],
                    document
            )
        }