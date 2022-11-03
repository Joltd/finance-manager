package com.evgenltd.financemanager.importexport

import com.evgenltd.financemanager.importexport.component.*
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.io.File
import java.time.LocalDate
import java.time.Month

fun main() {
    readTinkoffAllRecords()
}

fun readBccExport() {

    val raw = readBcc("KZT", "C:\\Users\\lebed\\Dropbox\\Diary\\Home\\finance\\budgets\\bcc.html")

    val result = mapData("Банк ЦентрКредит", raw, "C:\\Users\\lebed\\IdeaProjects\\finance-manager\\server\\src\\main\\resources\\rules.csv")

    val categories = result.skipped
            .groupBy { it.description }
            .map { Group(it.key, it.value.map { it.asString() }) }
            .sortedBy { it.records.size }

    val rows = result.documents.map { exportDocument(it) }

    println()

}

fun readKaspiExport() {

    val raw = readKaspi("KZT", "C:\\Users\\lebed\\Dropbox\\Diary\\Home\\finance\\budgets\\kaspi.csv")

    val result = mapData("Kaspi Банк", raw, "C:\\Users\\lebed\\IdeaProjects\\finance-manager\\server\\src\\main\\resources\\rules.csv")

    val categories = result.skipped
            .groupBy { it.description }
            .map { Group(it.key, it.value.map { it.asString() }) }
            .sortedBy { it.records.size }

    println()

}

fun readTinkoffAllRecords() {

    val raw = readTinkoff("RUB", "C:\\Users\\lebed\\Dropbox\\Diary\\Home\\finance\\budgets\\tinkoff-black-all.csv")
            .filter {
                it.date.year == 2022
            }
    val result = mapData("Tinkoff Black Card", raw, "C:\\Users\\lebed\\IdeaProjects\\finance-manager\\server\\src\\main\\resources\\rules.csv")

    val categories = result.skipped
            .groupBy { it.description.split("|")[0] }
            .map { Group(it.key, it.value.map { it.asString() }) }
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
        val records: List<String>
) {
    override fun toString(): String = "$category - ${records.size}"
}

private fun RawDataRecord.asString(): String =
        "$date $amount $description"


private fun readAllExportedDocs() {
    val folder = File("C:\\Users\\lebed\\Dropbox\\Diary\\Home\\finance\\documents\\2022-11-02")
    val allDocs = folder.listFiles()
            .flatMap { readFinance(it.absolutePath) }
    println()
}