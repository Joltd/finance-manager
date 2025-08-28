package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.ai.record.EmbeddingRecord
import java.time.LocalDate
import java.util.*

data class ImportDataCreateRequest(
    val account: UUID,
)

data class ImportDataLinkRequest(
    val entryId: UUID,
    val operationId: UUID,
)

data class ImportDataUnlinkRequest(
    val entryIds: List<UUID>,
)

data class ImportDataFinishRequest(
    val revise: Boolean
)

data class ImportDataRecord(
    val id: UUID,
    val account: AccountRecord,
    val dateRange: Range<LocalDate>?,
    val progress: Boolean,
    val valid: Boolean,
    val totals: List<ImportDataTotalRecord>
)

data class ImportDataTotalRecord(
    val currency: String,
    val operation: Amount?,
    val suggested: Amount?,
    val parsed: Amount?,
    val actual: Amount?,
    val valid: Boolean,
)

data class EntryFilter(
    val date: DateRange? = null,
    val linkage: Boolean? = null,
    val entryVisible: Boolean? = null,
    val operationVisible: Boolean? = null,
    val totalValid: Boolean? = null,
)

data class ImportDataEntryGroupRecord(
    val date: LocalDate,
    val valid: Boolean? = null,
    val totals: List<ImportDataTotalRecord> = emptyList(),
    val entries: List<ImportDataEntryRecord> = emptyList(),
)

data class ImportDataEntryRecord(
    val id: UUID? = null,
    val linked: Boolean = false,
    val operation: OperationRecord? = null,
    val operationVisible: Boolean = true,
    val parsed: ImportDataOperationRecord? = null,
    val parsedVisible: Boolean = true,
    val suggestions: List<ImportDataOperationRecord> = emptyList(),
)

data class ImportDataOperationRecord(
    val id: UUID? = null,
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: AccountRecord?,
    val amountTo: Amount,
    val accountTo: AccountRecord?,
    val description: String?,
    val raw: List<String> = emptyList(),
    val hint: EmbeddingRecord? = null,
    val selected: Boolean,
    val distance: Double?,
    val rating: SuggestionRating? = null,
)

data class ImportDataEntryVisibilityRequest(
    val operations: List<UUID>,
    val entries: List<UUID>,
    val visible: Boolean,
)

enum class SuggestionRating {
    GOOD,
    FAIR,
    POOR,
}

data class ImportDataParsedEntry(
    val rawEntries: List<String> = emptyList(),
    val date: LocalDate,
    val type: OperationType,
    val accountFrom: Account? = null,
    val amountFrom: Amount,
    val accountTo: Account? = null,
    val amountTo: Amount,
    val description: String,
    val hint: String? = null,
)

interface ImportDataDateRange {
    val min: LocalDate
    val max: LocalDate
}

interface AccountScore {
    val accountId: UUID
    val score: Double
}

data class OperationKey(
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: UUID,
    val amountTo: Amount,
    val accountTo: UUID
)

data class TotalEntry(
    val date: LocalDate,
    val amount: Amount,
)