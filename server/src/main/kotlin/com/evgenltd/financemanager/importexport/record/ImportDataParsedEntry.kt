package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

data class ImportDataParsedEntry(
    val id: String,
    val rawEntries: List<String>,
    val type: String,
    val date: LocalDate,
    val amount: Amount? = null,
    val description: String,
    val amountFrom: Amount? = null,
    val amountTo: Amount? = null
)

