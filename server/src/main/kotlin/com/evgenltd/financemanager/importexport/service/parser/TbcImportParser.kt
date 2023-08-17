package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.abs
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.UUID

@Service
class TbcImportParser : ImportParser {

    override val id = "TBC"
    override val name = "TBC"

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {
        val lines = stream.readCsv(skip = 1)
        return lines.parseExchanges() + lines.parseRegularOperations()
    }

    private fun List<CsvRow>.parseExchanges(): List<ImportDataParsedEntry> {
        val iterator = filter { it[TRANSACTION_TYPE] == EXCHANGE_OPERATION }.iterator()
        val result = mutableListOf<ImportDataParsedEntry>()
        while (iterator.hasNext()) {
            val first = iterator.next()
            val second = iterator.next()

            val date = first[DATE].date("dd/MM/yyyy")
            val description = first[DESCRIPTION].trim()

            val firstAmount = fromFractionalString(first[AMOUNT], first[CURRENCY])
            val secondAmount = fromFractionalString(second[AMOUNT], second[CURRENCY])
            val (from, to) = if (firstAmount.value < 0 && secondAmount.value > 0) {
                firstAmount.abs() to secondAmount
            } else if (firstAmount.value > 0 && secondAmount.value < 0) {
                secondAmount.abs() to firstAmount
            } else {
                throw IllegalStateException("Invalid exchange, from $first, to $second, date $date")
            }

            val entry = ImportDataParsedEntry(
                id = UUID.randomUUID().toString(),
                rawEntries = listOf(first.toString(), second.toString()),
                type = EXCHANGE_DOCUMENT_TYPE,
                date = date,
                amount = null,
                description = description,
                amountFrom = from,
                amountTo = to,
            )
            result.add(entry)
        }
        return result
    }

    private fun List<CsvRow>.parseRegularOperations(): List<ImportDataParsedEntry> =
        filter { it[TRANSACTION_TYPE] == EXCHANGE_OPERATION }
            .map {
                val amount = fromFractionalString(it[AMOUNT], it[CURRENCY])
                ImportDataParsedEntry(
                    id = UUID.randomUUID().toString(),
                    rawEntries = listOf(it.toString()),
                    type = if (amount.isNegative()) EXPENSE_DOCUMENT_TYPE else INCOME_DOCUMENT_TYPE,
                    date = it[DATE].date("dd/MM/yyyy"),
                    amount = amount.abs(),
                    description = it[DESCRIPTION].trim(),
                    amountFrom = null,
                    amountTo = null,
                )
            }

    private companion object {
        const val TRANSACTION_TYPE = "Transaction Type"
        const val DATE = "\uFEFFDate"
        const val AMOUNT = "Amount"
        const val CURRENCY = "Currency"
        const val DESCRIPTION = "Description"

        const val EXPENSE_DOCUMENT_TYPE = "expense"
        const val INCOME_DOCUMENT_TYPE = "income"
        const val EXCHANGE_DOCUMENT_TYPE = "exchange"
        const val EXCHANGE_OPERATION = "Currency exchange"
    }


}