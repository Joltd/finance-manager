package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importexport.component.*
import com.evgenltd.financemanager.importexport.record.RawDataRecord

private const val RULES_ROOT = """C:\Users\lebed\IdeaProjects\finance-manager\server\src\main\resources\rules"""
private const val SOURCE_ROOT = """C:\Users\lebed\Dropbox\Diary\Home\finance\budgets"""

fun tinkoffBlackCardRub(filter: (RawDataRecord) -> Boolean = { true }): MapDataResult {
    val raw = com.evgenltd.financemanager.importexport.component.runner.readCsv("RUB", """$SOURCE_ROOT\tinkoff-rub.csv""").filter { filter(it) }
    return mapData("Tinkoff Black Card", raw, """$RULES_ROOT\tinkoff-rub\main.csv""")
}

fun tinkoffBlackCardUsd(filter: (RawDataRecord) -> Boolean = { true }): MapDataResult {
    val raw = com.evgenltd.financemanager.importexport.component.runner.readCsv("USD", """$SOURCE_ROOT\tinkoff-usd.csv""").filter { filter(it) }
    return mapData("Tinkoff Black Card", raw, """$RULES_ROOT\tinkoff-usd\main.csv""")
}

private fun readCsv(currency: String, path: String): List<RawDataRecord> = readCsv(path, ";")
        .filter { it[3].clean() == "OK" }
        .map {
            RawDataRecord(
                    it[0].clean().dateTime("dd.MM.yyyy HH:mm:ss"),
                    it[6].clean().amount(currency),
                    "${it[9].clean()}|${it[11].clean()}"
            )
        }

private fun String.clean(): String = replace("\"", "")