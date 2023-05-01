package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun main(args: Array<String>) {
//    bccKzt("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\bcc-2023-03-26.html""", "https://localhost/finance-manager/api")
    tbc("""C:\Users\lebed\Downloads\transactions_history_20230325_20230503.csv""", "http://localhost:8080")
//    tbcExchanges("""C:\Users\lebed\Downloads\transactions_history_20230325_20230503.csv""", "http://localhost:8080")
//    common("""C:\Users\lebed\Dropbox\Diary\Home\finance\finance-manager\data\data-2023-04-29.csv""", "http://localhost:8080")
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}