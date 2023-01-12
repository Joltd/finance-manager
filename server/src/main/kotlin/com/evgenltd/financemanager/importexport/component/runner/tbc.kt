package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.common.util.abs
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.component.DocumentEntry
import com.evgenltd.financemanager.importexport.component.amount
import com.evgenltd.financemanager.importexport.component.date
import com.evgenltd.financemanager.importexport.component.performImport
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.io.File
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.math.abs

fun tbc(
    file: String,
    host: String
) {
    File(file).tbc()
        .performImport(host, "TBC", "/tbc/main.csv")
}

private fun File.tbc() = readCsv(absolutePath)
    .filter { it["Transaction Type"] != "Currency exchange" }
    .map {
        RawDataRecord(
            it["\uFEFFDate"].date("dd/MM/yyyy"),
            it["Amount"].amount(it["Currency"]),
            it["Description"]
        )
    }

fun tbcExchanges(
    file: String,
    host: String
) {
    val account = "TBC"

    val csv = readCsv(file)
    val usd = csv.filter { it["Currency"] == "USD" && it["Transaction Type"] == "Currency exchange" }
    val gel = csv.filter { it["Currency"] == "GEL" && it["Transaction Type"] == "Currency exchange" }

    usd.mapIndexed { index, usdRow ->
        val gelRow = gel[index]
        val document = DocumentExchangeRecord(
            id = null,
            date = usdRow["\uFEFFDate"].date("dd/MM/yyyy"),
            accountFromName = account,
            amountFrom = usdRow["Amount"].amount("USD").abs(),
            accountToName = account,
            amountTo = gelRow["Amount"].amount("GEL"),
            description = "",
            accountFrom = null,
            accountTo = null,
        )
        val documentTyped = DocumentTypedRecord(
            "exchange",
            document
        )
        DocumentEntry("", documentTyped)
    }.performImport(host, account)
}