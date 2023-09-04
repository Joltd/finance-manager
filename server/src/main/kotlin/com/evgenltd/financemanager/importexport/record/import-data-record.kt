package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import java.util.UUID

data class ImportDataRecord(
    val id: UUID,
    val parser: Reference,
    val account: AccountRecord,
    val status: ImportDataStatus,
    val message: String?,
    val progress: Double
)

data class ImportDataEntryRecord(
    val id: UUID,
)

data class ImportDataEntryFilter(
    val page: Int,
    val size: Int = 20,
    val preparationResult: Boolean? = null,
    val option: ImportOption? = null,
    val importResult: ImportResult? = null,
)

data class ImportDataEntryPage(
    val page: Int,
    val size: Int,
    val total: Long,
    val entries: List<ImportDataEntryRecord>,
)