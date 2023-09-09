package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import org.jsoup.nodes.Node
import java.io.InputStream
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun String.date(pattern: String): LocalDate = LocalDate.parse(trim(), DateTimeFormatter.ofPattern(pattern))

fun String.dateTime(pattern: String): LocalDate = LocalDateTime.parse(trim(), DateTimeFormatter.ofPattern(pattern)).toLocalDate()

fun String.amount(currency: String): Amount = fromFractionalString(trim(), currency)

operator fun Node.get(index: Int): Node = childNode(index)

fun InputStream.readCsv(skip: Int = 0, delimiter: String = ","): List<CsvRow> {
    val lines = bufferedReader()
        .use { it.readLines() }
        .drop(skip)
    if (lines.size < 2) {
        return emptyList()
    }

    val fields = lines.first()
        .split(delimiter)
        .map { it.trim() }
        .toList()

    return lines.drop(1)
        .map {
            val values = it.split(delimiter)
            val cells = values.mapIndexed { index, cell -> fields[index] to cell }
                .associate { it }
            CsvRow(values, cells)
        }
}

class CsvRow(
    private val values: List<String>,
    private val cells: Map<String,String>
) {
    operator fun get(name: String): String = cells[name] ?: ""

    operator fun get(index: Int): String = if (index >= values.size) "" else values[index]

    override fun toString(): String = values.joinToString(", ")
}