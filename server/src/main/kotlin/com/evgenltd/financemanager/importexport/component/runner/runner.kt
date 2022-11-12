package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.component.export
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import java.math.BigDecimal

fun main() {
    val result = bccKzt()
    result.documents.export("""2022-11-09\bcc-kzt.csv""")
    println()
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}