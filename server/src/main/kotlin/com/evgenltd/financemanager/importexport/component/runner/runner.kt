package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.RawDataRecord

fun main(args: Array<String>) {
//    bccKzt("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\bcc-2023-03-26.html""", "https://localhost/finance-manager/api")
//    tbc("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\tbc_20230220_20230327.csv""", "https://localhost/finance-manager/api")
//    tbcExchanges("""C:\Users\lebed\Dropbox\Diary\Home\finance\budgets\tbc_20230220_20230327.csv""", "https://localhost/finance-manager/api")
}

private fun List<RawDataRecord>.total(): Amount {
    return map { it.amount }.reduce { acc, amount -> acc + amount }
}