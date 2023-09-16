package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import java.time.LocalDate
import java.util.UUID

data class OperationReviseRecord(
    val id: UUID?,
    val dateFrom: LocalDate?,
    val dateTo: LocalDate?,
    val currency: String?,
    val account: AccountRecord,
    val parser: Reference,
    val dates: List<LocalDate>
)

data class OperationReviseEntryRecord(
    val id: UUID,
    val date: LocalDate,
    val operation: OperationRecord?,
    val parsedEntry: ImportDataParsedEntry?
)

data class OperationReviseEntryFilter(
    val date: LocalDate,
    val hideMatched: Boolean
)
