package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.component.*
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import org.jsoup.Jsoup
import org.jsoup.nodes.Node
import java.io.File
import java.time.LocalDate

private const val RULES_ROOT = """C:\Users\lebed\IdeaProjects\finance-manager\server\src\main\resources\rules"""
private const val FILES_ROOT = """C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\sber"""
//
//fun sberCard0050(): MapDataResult {
//    val raw = readHtml("""$FILES_ROOT\0050 - 2018-2019.html""") +
//            readHtml("""$FILES_ROOT\0050 - 2019-2020.html""") +
//            readHtml("""$FILES_ROOT\0050 - 2020-2021.html""") +
//            listOf(RawDataRecord(LocalDate.of(2019,10,11), "130".amount("RUB"), "Прочие операции|SBOL перевод 5336****5289 К. СЕРГЕЙ ГЕННАДЬЕВИЧ"))
//    return mapData("Сбер Карта (0050)", raw, """$RULES_ROOT\sber\main.csv""")
//}
//
//fun sberCard0234(): MapDataResult {
//    val raw = readHtml("""$FILES_ROOT\0234 - 2021.html""") +
//            readHtml("""$FILES_ROOT\0234 - 2021-2022.html""")
//    return mapData("Сбер Карта (0234)", raw, """$RULES_ROOT\sber\main.csv""")
//}
//
//fun sberPayAccount(): MapDataResult {
//    val raw = readTxt("""$FILES_ROOT\sber-pay-account.txt""")
//    return mapData("Сбер Платежный Счет", raw, """$RULES_ROOT\sber\main.csv""")
//}

private fun readHtml(path: String): List<RawDataRecord> {

    val lines = Jsoup.parse(File(path))
            .select("tr")
            .map {
                it.select("td")
                        .select("p")
                        .map { it[0].toString() }
                        .filter { it != "<br>" }
            }
            .filter {
                try {
                    it[0].date("dd.MM.yyyy")
                    true
                } catch (e: Exception) {
                    false
                }
            }

    val result = mutableListOf<RawDataRecord>()
    var index = 0
    while (index < lines.size) {
        val date = lines[index][0]
        val category = lines[index][2]
        val amount = lines[index][3]
        val sign = if (amount.contains("+")) "" else "-"
        val secondLine = lines[index + 1]
        val description = if (secondLine.size > 2) secondLine[2] else secondLine[1]
        result.add(RawDataRecord(
                date.date("dd.MM.yyyy"),
                (sign + amount).cleanAmount().amount("RUB"),
                "$category|$description"
        ))
        index += 2
    }
    return result

}

private fun readTxt(path: String): List<RawDataRecord> {
    val lines = File(path).readLines()
    val result = mutableListOf<RawDataRecord>()
    var index = 0
    while (index < lines.size) {
        val date = lines[index].split(" ")[0]
        val category = lines[index + 2]
        val description = lines[index + 3]
        val line = lines[index + 4].replace(" ", "")
        val amount = line.substring(0, line.indexOf(",") + 3)
        result.add(RawDataRecord(
                date.date("dd.MM.yyyy"),
                amount.cleanAmount().amount("RUB"),
                "$category|$description"
        ))
        index += 5
    }
    return result
}

private fun String.cleanAmount(): String = trim()
        .replace(" ", "")
        .replace(",", ".")