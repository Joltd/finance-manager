package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.ai.record.ParseEntry
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.Locale

@Service
class AiImportParser(
    private val aiService: AiService,
    private val fileService: FileService,
) : ImportParser {

    override val name: String = "AI"

    override fun parse(importData: ImportData, filename: String): List<ImportDataParsedEntry> =
        fileService.load(filename) { stream ->
            aiService.parse(filename, stream, importData.currency).map { it.toParsedEntry(importData.currency) }
        }

    private fun ParseEntry.toParsedEntry(defaultCurrency: String?): ImportDataParsedEntry {
        val normalizedDate = date
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
        val normalizedAmount = amount
            ?.trim()
            ?.removePrefix("+")
            ?.removePrefix("-")
            ?.replace(" ", "")
            ?.takeIf { it.matches(DECIMAL_AMOUNT) }
        val normalizedCurrency = (currency ?: defaultCurrency)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?.uppercase(Locale.ROOT)

        val problems = buildList {
            if (normalizedDate == null) add("Date is missing or invalid")
            if (direction == null) add("Direction is missing")
            if (normalizedAmount == null) add("Amount is missing")
            if (normalizedCurrency == null) add("Currency is missing")
        }
        val normalizedMessage = listOfNotNull(message.clean(), problems.takeIf { it.isNotEmpty() }?.joinToString("; "))
            .joinToString("; ")
            .takeIf { it.isNotEmpty() }

        return ImportDataParsedEntry(
            raw = raw,
            date = normalizedDate,
            direction = direction,
            amount = normalizedAmount,
            currency = normalizedCurrency,
            transactionId = transactionId.clean(),
            mcc = mcc.clean(),
            bankType = bankType.clean(),
            bankCategory = bankCategory.clean(),
            merchant = merchant.clean(),
            counterparty = counterparty.clean(),
            purpose = purpose.clean(),
            description = description.clean(),
            message = normalizedMessage,
        )
    }

    private fun String?.clean(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

    private companion object {
        val DECIMAL_AMOUNT = Regex("\\d+(\\.\\d+)?")
    }

}
