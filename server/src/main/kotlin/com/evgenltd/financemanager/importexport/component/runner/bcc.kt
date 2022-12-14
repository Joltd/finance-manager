package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.importexport.component.*
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import org.jsoup.Jsoup
import java.io.File

fun bccKzt(
    file: String,
    host: String
) = bcc(file, host, "KZT")

fun bccRub(
    file: String,
    host: String
) = bcc(file, host, "RUB")

private fun bcc(
    file: String,
    host: String,
    currency: String
) {
    File(file).bcc(currency)
        .performImport(host, "Банк ЦентрКредит", "/bcc/main.csv")
}

private fun File.bcc(currency: String): List<RawDataRecord> = Jsoup.parse(this)
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
        RawDataRecord(
            descriptionNode[1][0].toString().date("dd.MM.yyyy"),
            (sign + amount).amount(currency),
            description
        )
    }


private fun String.cleanAmount(): String = replace("₸", "")
    .replace(" ", "")
