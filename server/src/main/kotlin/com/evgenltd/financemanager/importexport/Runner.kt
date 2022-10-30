package com.evgenltd.financemanager.importexport

import com.evgenltd.financemanager.importexport.component.mapData
import com.evgenltd.financemanager.importexport.component.readTinkoff
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.time.LocalDate
import java.time.Month

fun main() {

    val raw = readTinkoff("RUB", "C:\\Users\\lebed\\Dropbox\\Diary\\Home\\relocation\\budgets\\tinkoff-black-all.csv")
            .filter {
                it.date.year == 2022
                        && it.date.month == Month.SEPTEMBER
                        && it.date.isBefore(LocalDate.of(2022, 9, 21))
            }
    val result = mapData("Tinkoff Black Card", raw, "C:\\Users\\lebed\\IdeaProjects\\finance-manager\\server\\src\\main\\resources\\rules\\tinkoff.csv")

    val categories = result.skipped
            .groupBy { it.description.split("|")[0] }
            .map { Group(it.key, it.value) }
            .sortedBy { it.records.size }
//    val descriptions = result.map { it.description }.toSet()

//    val stores = result.filter { it.category == "Супермаркеты" }
//            .groupBy { it.description }
//            .map { it.key to it.value.size }
//            .sortedBy { it.second }

    println()
}

private class Group(
        val category: String,
        val records: List<RawDataRecord>
) {
    override fun toString(): String = "$category - ${records.size}"
}