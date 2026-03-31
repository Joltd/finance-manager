package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsed
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.springframework.stereotype.Service
import java.io.InputStream

@Service
class TinkoffImportParser : ImportParser {

    override val name: String = "Tinkoff"

    override fun parse(importData: ImportData, stream: InputStream): ImportDataParsed = ImportDataParsed(
        entries = stream
            .readCsv(delimiter = ";")
            .filter { it[3].clean() == "OK" }
            .map { cells ->
                val date = cells[0].clean().dateTime("dd.MM.yyyy HH:mm:ss")
                val amount = cells[6].clean().amount("RUB")
                val description = cells[11].clean()
                val category = cells[9].clean()
                val mcc = cells[10].clean().takeIf { it.isNotBlank() }?.let { " ($it)" } ?: ""
                val type = if (amount.value < 0) OperationType.EXPENSE else OperationType.INCOME
                val hint = type.hint()?.let { typeHint -> "$typeHint $description - $category$mcc" }
                ImportDataParsedEntry(
                    raw = cells.toString(),
                    date = date,
                    type = type,
                    amountFrom = amount.abs(),
                    accountFrom = null,
                    amountTo = amount.abs(),
                    accountTo = null,
                    description = "${category}|${description}",
                    hint = hint,
                )
            },
        failed = emptyList(),
    )

    private fun String.clean(): String = replace("\"", "")

    private fun OperationType.hint(): String? = when (this) {
        OperationType.EXPENSE -> "Списание"
        OperationType.INCOME -> "Поступление"
        else -> null
    }

}