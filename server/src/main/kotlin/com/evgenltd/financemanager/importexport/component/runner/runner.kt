package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun main(args: Array<String>) {
//    bccKzt("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\bcc-2023-01-12.html""", args[0])
    tbc("""C:\Users\lebed\Downloads\transactions_history_20220113_20230124.csv""", args[0])
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}