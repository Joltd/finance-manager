package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*

@Service
class TinkoffImportParser : ImportParser {

    override val id: UUID = UUID.fromString("2ba06a21-4e00-4625-82c1-d81f56c89177")
    override val name: String = "Tinkoff"

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> = stream
        .readCsv(delimiter = ";")
        .filter { it[3].clean() == "OK" }
        .map {
            val amount = it[6].clean().amount("RUB")
            ImportDataParsedEntry(
                rawEntries = listOf(it.toString()),
                date = it[0].clean().dateTime("dd.MM.yyyy HH:mm:ss"),
                type = if (amount.value < 0) OperationType.EXPENSE else OperationType.INCOME,
                amountFrom = amount.abs(),
                accountFrom = null,
                amountTo = amount.abs(),
                accountTo = null,
                description = "${it[9].clean()}|${it[11].clean()}"
            )
        }

    private fun String.clean(): String = replace("\"", "")

}