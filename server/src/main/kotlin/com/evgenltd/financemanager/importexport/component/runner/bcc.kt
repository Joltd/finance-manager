package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.importexport.component.*
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import org.jsoup.Jsoup
import java.io.File

private const val RULES_ROOT = """C:\Users\lebed\IdeaProjects\finance-manager\server\src\main\resources\rules"""
private const val SOURCE_ROOT = """C:\Users\lebed\Dropbox\Diary\Home\finance\budgets"""

fun bccKzt(): MapDataResult {
    val raw = readHtml("bcc-2022-11-24.html", "KZT")
    return mapData("Банк ЦентрКредит", raw, """$RULES_ROOT\bcc\main.csv""")
}

private fun readHtml(path: String, currency: String): List<RawDataRecord> = Jsoup.parse(File("""$SOURCE_ROOT\$path"""))
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

private fun String.cleanAmount(): String = replace("₸", "").replace(" ", "")
