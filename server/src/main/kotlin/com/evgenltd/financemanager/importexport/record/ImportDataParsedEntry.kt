package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class ImportDataParsedEntry(
    val rawEntries: List<String>,
    val date: LocalDate,
    val accountFrom: UUID,
    val amountFrom: Amount,
    val accountTo: UUID,
    val amountTo: Amount,
    val description: String
)