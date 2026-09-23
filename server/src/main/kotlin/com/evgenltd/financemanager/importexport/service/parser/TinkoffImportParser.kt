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
            .filter { row -> STATUS_OK.any { row[STATUS].clean().trim().equals(it, ignoreCase = true) } }
            .map { cells ->
                val date = cells[DATE].clean().dateTime("dd.MM.yyyy HH:mm:ss")
                val currency = cells[ACCOUNT_CURRENCY].clean().ifBlank { DEFAULT_CURRENCY }
                val amount = cells[ACCOUNT_AMOUNT].clean().amount(currency)
                val description = cells[DESCRIPTION].clean()
                val category = cells[USER_CATEGORY].clean().ifBlank { cells[DEFAULT_CATEGORY].clean() }
                val mcc = cells[MCC].clean().takeIf { it.isNotBlank() }?.let { " ($it)" } ?: ""
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

    private companion object {
        const val DATE = "Дата операции"
        const val ACCOUNT_AMOUNT = "Сумма в валюте счёта"
        const val ACCOUNT_CURRENCY = "Валюта счёта"
        const val STATUS = "Статус"
        const val DEFAULT_CATEGORY = "Категория по-умолчанию"
        const val USER_CATEGORY = "Ваша категория"
        const val MCC = "MCC"
        const val DESCRIPTION = "Описание"

        // latin and cyrillic spellings
        val STATUS_OK = listOf("OK", "ОК")
        const val DEFAULT_CURRENCY = "RUB"
    }

}
