package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*


@Service
class TbcImportParser : ImportParser {

    override val id: UUID = UUID.fromString("4cedb5cf-d946-4702-8c78-1b0c47c225a0")
    override val name: String = "TBC"

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {
        return emptyList()
//        val lines = stream.readCsv(skip = 1)
//        return lines.parseExchanges() + lines.parseRegularOperations()
    }

//    private fun List<CsvRow>.parseExchanges(): List<ImportDataParsedEntry> {
//        val iterator = filter { it[TRANSACTION_TYPE] == EXCHANGE_OPERATION }.iterator()
//        val result = mutableListOf<ImportDataParsedEntry>()
//        while (iterator.hasNext()) {
//            val first = iterator.next()
//            val second = iterator.next()
//
//            val date = first[DATE].date("dd/MM/yyyy")
//            val description = first[DESCRIPTION].trim()
//
//            val firstAmount = fromFractionalString(first[AMOUNT], first[CURRENCY])
//            val secondAmount = fromFractionalString(second[AMOUNT], second[CURRENCY])
//            val (from, to) = if (firstAmount.value < 0 && secondAmount.value > 0) {
//                firstAmount.abs() to secondAmount
//            } else if (firstAmount.value > 0 && secondAmount.value < 0) {
//                secondAmount.abs() to firstAmount
//            } else {
//                throw IllegalStateException("Invalid exchange, from $first, to $second, date $date")
//            }
//
//            val entry = ImportDataParsedEntry(
//                rawEntries = listOf(first.toString(), second.toString()),
//                date = date,
//                accountFrom = ,
//                amountFrom = from,
//                accountTo = ,
//                amountTo = to,
//                description = description,
//            )
//            result.add(entry)
//        }
//        return result
//    }
//
//    private fun List<CsvRow>.parseRegularOperations(): List<ImportDataParsedEntry> =
//        filter { it[TRANSACTION_TYPE] != EXCHANGE_OPERATION }
//            .map {
//                val amount = fromFractionalString(it[AMOUNT], it[CURRENCY])
//                ImportDataParsedEntry(
//                    rawEntries = listOf(it.toString()),
//                    date = it[DATE].date("dd/MM/yyyy"),
//                    amount = amount.abs(),
//                    description = it[DESCRIPTION].trim(),
//                    amountFrom = null,
//                    amountTo = null,
//                )
//            }
//
//    private companion object {
//        const val TRANSACTION_TYPE = "Transaction Type"
//        const val DATE = "Date"
//        const val AMOUNT = "Amount"
//        const val CURRENCY = "Currency"
//        const val DESCRIPTION = "Description"
//
//        const val EXPENSE_DOCUMENT_TYPE = "expense"
//        const val INCOME_DOCUMENT_TYPE = "income"
//        const val EXCHANGE_DOCUMENT_TYPE = "exchange"
//        const val EXCHANGE_OPERATION = "Currency exchange"
//    }


}