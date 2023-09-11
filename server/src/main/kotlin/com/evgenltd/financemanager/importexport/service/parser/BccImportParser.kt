package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.jsoup.Jsoup
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*

@Service
class BccImportParser : ImportParser {

    override val id: UUID = UUID.fromString("cdc75c19-c79d-4b9b-b54e-581b52750e5b")
    override val name: String = "Bank Center Credit"

    override fun parse(importData: ImportData, stream: InputStream): List<ImportDataParsedEntry> = Jsoup.parse(stream, null, "")
        .select(".history__list__item")
        .map {
            val descriptionNode = it[1][1]
            val description = descriptionNode[0][0].toString().trim()
            val root = it[3][0]
            val sign = if (root[1].childNodeSize() > 0) {
                root[1][0].toString().trim()
            } else {
                root[2][0].toString().trim()
            }
            val amount = it[3][0][3].toString().trim().cleanAmount()
            ImportDataParsedEntry(
                listOf(it.toString()),
                descriptionNode[1][0].toString().date("dd.MM.yyyy"),
                if (sign == "-") OperationType.EXPENSE else OperationType.INCOME,
                null,
                amount.amount("KZT"),
                null,
                amount.amount("KZT"),
                description
            )
        }

    private fun String.cleanAmount(): String = replace("₸", "")
        .replace(" ", "")
}