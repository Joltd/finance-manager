package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importexport.component.amount
import com.evgenltd.financemanager.importexport.component.date
import com.evgenltd.financemanager.importexport.record.RawDataRecord

private const val SOURCE_ROOT = """C:\Users\lebed\Dropbox\Diary\Home\finance\budgets"""

//fun kaspi(): MapDataResult {
//    val raw = read("kaspi.csv")
//    return mapData("Kaspi Банк", raw, """$RULES_ROOT\kaspi\main.csv""")
//}

private fun read(path: String): List<RawDataRecord> = readCsv("""$SOURCE_ROOT\$path""")
        .map {
            RawDataRecord(
                    it[0].date("dd.MM.yy"),
                    (it[1] + it[2]).cleanAmount().amount("KZT"),
                    "${it[3]}|${it[4]}"
            )
        }

private fun String.cleanAmount(): String = replace("₸", "").replace(" ", "")