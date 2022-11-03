package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.util.parseAmount
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.component.rulemanager.Hint
import com.evgenltd.financemanager.importexport.component.rulemanager.buildRuleManager
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun mapData(account: String, input: List<RawDataRecord>, rulesPath: String): MapDataResult {
    val ruleManager = buildRuleManager(rulesPath)

    val documents = mutableListOf<DocumentTypedRecord>()
    val skipped = mutableListOf<RawDataRecord>()

    for (record in input) {

        if (record.amount.value == 0L) {
            continue
        }

        val hint = ruleManager.find(record)
        if (hint == null) {
            skipped.add(record)
            continue
        }

        val document = makeDocument(account, record, hint)
        documents.add(document)

    }

    return MapDataResult(
            documents,
            skipped
    )
}

private fun makeDocument(account: String, record: RawDataRecord, hint: Hint): DocumentTypedRecord {

    val document = when (hint.type) {
        "expense" -> DocumentExpenseRecord(
                id = null,
                date = record.date,
                amount = -record.amount,
                accountName = account,
                expenseCategoryName = hint.category,
                description = "",
                account = "",
                expenseCategory = ""
        )
        "income" -> DocumentIncomeRecord(
                id = null,
                date = record.date,
                amount = record.amount,
                accountName = account,
                incomeCategoryName = hint.category,
                description = "",
                account = "",
                incomeCategory = ""
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
                        description = "",
                        accountFrom = "",
                        accountTo = "",
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
                        description = "",
                        accountFrom = "",
                        accountTo = ""
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
        val documents: List<DocumentTypedRecord>,
        val skipped: List<RawDataRecord>
)