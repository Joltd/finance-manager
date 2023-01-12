package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importexport.component.amount
import com.evgenltd.financemanager.importexport.component.dateTime
import com.evgenltd.financemanager.importexport.component.performImport
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.io.File

fun tinkoffRub(
    file: String,
    host: String
) {
    File(file).tinkoff("RUB")
        .performImport(host, "Tinkoff Black Card", "/tinkoff-rub/main.csv")
}

fun tinkoffUsd(
    file: String,
    host: String
) {
    File(file).tinkoff("USD")
        .performImport(host, "Tinkoff Black Card", "/tinkoff-usd/main.csv")
}

private fun File.tinkoff(currency: String): List<RawDataRecord> = readCsv(absolutePath, ";")
    .filter { it[3].clean() == "OK" }
    .map {
        RawDataRecord(
            it[0].clean().dateTime("dd.MM.yyyy HH:mm:ss"),
            it[6].clean().amount(currency),
            "${it[9].clean()}|${it[11].clean()}"
        )
    }

private fun String.clean(): String = replace("\"", "")