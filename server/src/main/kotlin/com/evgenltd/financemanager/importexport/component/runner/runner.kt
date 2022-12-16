package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun main(args: Array<String>) {
    bccKzt("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\bcc-2022-11-24.html""", args[0])
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}