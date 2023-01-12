package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importexport.component.amount
import com.evgenltd.financemanager.importexport.component.date
import com.evgenltd.financemanager.importexport.component.performImport
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.io.File

fun kaspi(
    file: String,
    host: String
) {
    File(file).kaspi()
        .performImport(host, "Kaspi Банк", "/kaspi/main.csv")
}

private fun File.kaspi(): List<RawDataRecord> = readCsv(this.absolutePath)
        .map {
            RawDataRecord(
                    it[0].date("dd.MM.yy"),
                    (it[1] + it[2]).cleanAmount().amount("KZT"),
                    "${it[3]}|${it[4]}"
            )
        }

private fun String.cleanAmount(): String = replace("₸", "").replace(" ", "")