package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.abs
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.component.DocumentEntry
import com.evgenltd.financemanager.importexport.component.amount
import com.evgenltd.financemanager.importexport.component.date
import com.evgenltd.financemanager.importexport.component.performImport
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.io.File

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
    val iterator = csv.filter { it["Transaction Type"] == "Currency exchange" }.iterator()
    val result = mutableListOf<DocumentEntry>()
    while (iterator.hasNext()) {
        val first = iterator.next()
        val second = iterator.next()
        val date = first["\uFEFFDate"].date("dd/MM/yyyy")
        val firstAmount = first["Amount"].amount(first["Currency"])
        val secondAmount = second["Amount"].amount(second["Currency"])
        val (from, to) = asFromTo(firstAmount, secondAmount)

        val document = DocumentExchangeRecord(
            id = null,
            date = date,
            accountFromName = account,
            amountFrom = from,
            accountToName = account,
            amountTo = to,
            description = "",
            accountFrom = null,
            accountTo = null,
        )
        val documentTyped = DocumentTypedRecord(
            "exchange",
            document
        )
        result.add(DocumentEntry("$date,$firstAmount,$secondAmount", documentTyped))
        println("$date      $from -> $to")
    }

    println("Continue? [Yes/No]")
    val decision = readln()
    if (decision != "Yes") {
        return
    }

    result.performImport(host, account)
}

private fun asFromTo(first: Amount, second: Amount): Pair<Amount, Amount> = if (first.value < 0 && second.value > 0) {
    first.abs() to second
} else if (first.value > 0 && second.value < 0) {
    second.abs() to first
} else {
    throw IllegalStateException("Invalid exchange, from $first, to $second")
}