package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.component.export
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun main() {
    val result = tinkoffBlackCardRub()
    result.documents.export("""2022-11-09\tinkoff-black-card-rub.csv""")
    println()
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}