package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.common.util.isNegative
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsed
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.record.ImportDataParsedFailedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.springframework.stereotype.Service
import java.io.InputStream

@Service
class AiImportParser(
    private val aiService: AiService,
) : ImportParser {

    override val name: String = "AI"

    override fun parse(
        importData: ImportData,
        stream: InputStream
    ): ImportDataParsed {
        val account = importData.account

        val entries = mutableListOf<ImportDataParsedEntry>()
        val failed = mutableListOf<ImportDataParsedFailedEntry>()

        for (it in aiService.parse(stream)) {
            try {
                val date = it.date
                    ?.date("yyyy-MM-dd")
                    ?: throw IllegalStateException("Date is missing")
                val amountValue = it.amount
                    ?: throw IllegalStateException("Amount is missing")
                val currency = it.currency
                    ?: importData.currency
                    ?: throw IllegalStateException("Currency is missing")

                val amount = fromFractionalString(amountValue, currency)

                val type = if (amount.isNegative()) OperationType.EXPENSE else OperationType.INCOME

                val (accountFrom, accountTo) = when (type) {
                    OperationType.EXPENSE -> account to null
                    OperationType.INCOME -> null to account
                    else -> null to null
                }

                entries.add(
                    ImportDataParsedEntry(
                        rawEntries = listOf(it.raw),
                        date = date,
                        type = type,
                        accountFrom = accountFrom,
                        amountFrom = amount.abs(),
                        accountTo = accountTo,
                        amountTo = amount.abs(),
                        description = it.description.orEmpty(),
                        hint = it.hint,
                    )
                )
            } catch (e: Exception) {
                failed.add(ImportDataParsedFailedEntry(raw = it.raw, message = e.message ?: "Unknown error"))
            }
        }

        return ImportDataParsed(entries = entries, failed = failed)
    }

}
