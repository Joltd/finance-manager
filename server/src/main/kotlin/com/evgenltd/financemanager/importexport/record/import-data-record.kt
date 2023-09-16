package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
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
    val parsedEntry: ImportDataParsedEntry,
    val suggestedOperation: OperationRecord?,
    val similarOperations: List<OperationRecord>,
    val matchedCategoryMappings: List<CategoryMappingRecord>,
    val preparationResult: Boolean,
    val preparationError: String?,
    val option: ImportOption,
    val importResult: ImportResult,
    val importError: String?,
)

data class ImportDataEntryFilter(
    val page: Int,
    val size: Int = 20,
    val operationType: OperationType? = null,
    val preparationResult: Boolean? = null,
    val option: ImportOption? = null,
    val hideSkip: Boolean = false,
    val importResult: ImportResult? = null
)

data class ImportDataEntryPage(
    val page: Int,
    val size: Int,
    val total: Long,
    val entries: List<ImportDataEntryRecord>,
)

data class ImportDataEntryUpdateRequest(
    val suggestedOperation: OperationRecord? = null,
    val preparationResult: Boolean? = null,
    val option: ImportOption? = null,
)
