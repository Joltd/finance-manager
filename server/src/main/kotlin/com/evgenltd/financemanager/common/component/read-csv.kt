package com.evgenltd.financemanager.common.component

import java.nio.file.Files
import java.nio.file.Paths

fun readCsv(path: String, delimiter: String = ","): List<Row> {
    val lines = Files.readAllLines(Paths.get(path))

    val fields = lines.first().split(delimiter).toList()

    return lines.filterIndexed { index, _ -> index > 0 }
            .map {
                val values = it.split(delimiter)
                val cells = values
                        .mapIndexed { index, cell -> fields[index] to cell }
                        .associate { it }
                Row(values, cells)
            }

}

data class Row(
        private val values: List<String>,
        private val cells: Map<String,String>
) {

    operator fun get(name: String): String = cells[name] ?: throw IllegalArgumentException("Unknown field [$name]")

    operator fun get(index: Int): String = values[index]

}