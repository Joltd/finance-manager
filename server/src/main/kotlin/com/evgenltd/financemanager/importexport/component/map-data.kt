package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.parseAmount
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.component.rulemanager.Hint
import com.evgenltd.financemanager.importexport.component.rulemanager.buildRuleManager
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.time.LocalDate

fun List<RawDataRecord>.mapData(account: String, rules: String): MapDataResult {
    val ruleManager = buildRuleManager(rules)

    val documents = mutableListOf<DocumentEntry>()
    val skipped = mutableListOf<RawDataRecord>()

    for (record in this) {

        if (record.amount.value == 0L) {
            continue
        }

        val hint = ruleManager.find(record)
        if (hint == null) {
            skipped.add(record)
        } else {
            documents.add(DocumentEntry(
                record.toString(),
                makeDocument(account, record, hint)
            ))
        }

    }

    return MapDataResult(
            this,
            documents,
            skipped
    )
}

private fun makeSkipDocument(account: String, date: LocalDate, amount: Amount): DocumentTypedRecord =
        DocumentTypedRecord(
                type = "expense",
                value = DocumentExpenseRecord(
                        id = null,
                        date = date,
                        amount = -amount,
                        accountName = account,
                        expenseCategoryName = "Нераспределенное",
                        description = "",
                        account = "",
                        expenseCategory = ""
                )
        )

private fun makeDocument(account: String, record: RawDataRecord, hint: Hint): DocumentTypedRecord {

    val document = when (hint.type) {
        "expense" -> DocumentExpenseRecord(
                id = null,
                date = record.date,
                amount = -record.amount,
                accountName = account,
                expenseCategoryName = hint.category,
                description = record.toString(),
                account = null,
                expenseCategory = null
        )
        "income" -> DocumentIncomeRecord(
                id = null,
                date = record.date,
                amount = record.amount,
                accountName = account,
                incomeCategoryName = hint.category,
                description = record.toString(),
                account = null,
                incomeCategory = null
        )
        "exchange" -> {
            val oppositeAccount = if (hint.account == "~") account else hint.account
            if (record.amount.value < 0) {
                val oppositeAmount = if (hint.amount == "~") -record.amount else hint.amount.parseAmount()
                DocumentExchangeRecord(
                        id = null,
                        date = record.date,
                        accountFromName = account,
                        amountFrom = -record.amount,
                        accountToName = oppositeAccount,
                        amountTo = oppositeAmount,
                        description = record.toString(),
                        accountFrom = null,
                        accountTo = null,
                )
            } else {
                val oppositeAmount = if (hint.amount == "~") record.amount else hint.amount.parseAmount()
                DocumentExchangeRecord(
                        id = null,
                        date = record.date,
                        accountFromName = oppositeAccount,
                        amountFrom = oppositeAmount,
                        accountToName = account,
                        amountTo = record.amount,
                        description = record.toString(),
                        accountFrom = null,
                        accountTo = null
                )
            }
        }
        else -> throw IllegalArgumentException("Unknown document type [${hint.type}]")
    }

    return DocumentTypedRecord(
            hint.type,
            document
    )
}

data class MapDataResult(
        val raw: List<RawDataRecord>,
        val documents: List<DocumentEntry>,
        val skipped: List<RawDataRecord>
)

data class DocumentEntry(val raw: String, val document: DocumentTypedRecord)