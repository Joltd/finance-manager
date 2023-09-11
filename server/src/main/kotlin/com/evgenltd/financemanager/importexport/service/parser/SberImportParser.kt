package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.jsoup.Jsoup
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*

@Service
class SberImportParser : ImportParser {

    override val id: UUID = UUID.fromString("eb1869ad-7d1c-45c1-a4a3-a96c6b9d2855")
    override val name: String = "Sber"

    override fun parse(importData: ImportData, stream: InputStream): List<ImportDataParsedEntry> {
        val lines = Jsoup.parse(stream, null, "")
            .select("tr")
            .map { element -> element.select("td")
                .select("p")
                .map { it[0].toString() }
                .filter { it != "<br>" }
            }
            .filter {
                try {
                    it[0].date("dd.MM.yyyy")
                    true
                } catch (e: Exception) {
                    false
                }
            }

        val result = mutableListOf<ImportDataParsedEntry>()
        var index = 0
        while (index < lines.size) {
            val date = lines[index][0]
            val category = lines[index][2]
            val amount = lines[index][3]
            val secondLine = lines[index + 1]
            val description = if (secondLine.size > 2) secondLine[2] else secondLine[1]
            result.add(ImportDataParsedEntry(
                rawEntries = listOf(lines[index].toString(), lines[index + 1].toString()),
                date = date.date("dd.MM.yyyy"),
                type = if (amount.contains("+")) OperationType.INCOME else OperationType.EXPENSE,
                accountFrom = null,
                amountFrom = amount.cleanAmount().amount("RUB"),
                accountTo = null,
                amountTo = amount.cleanAmount().amount("RUB"),
                description = "$category|$description"
            ))
            index += 2
        }
        return result
    }

    private fun String.cleanAmount(): String = trim()
        .replace(" ", "")
        .replace(",", ".")
}