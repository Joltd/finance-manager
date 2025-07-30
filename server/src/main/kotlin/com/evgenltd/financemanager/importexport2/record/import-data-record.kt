package com.evgenltd.financemanager.importexport2.record

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import java.time.LocalDate
import java.util.*

data class ImportDataCreateRequest(
    val account: UUID,
)

data class ImportDataLinkRequest(
    val entryId: UUID,
    val operationId: UUID,
)

data class ImportDataLinkResul(
    val importDataId: UUID,
    val operationDate: LocalDate,
    val entryDate: LocalDate,
)

//

data class ImportDataRecord(
    val id: UUID,
    val account: AccountRecord,
    val dateRange: Range<LocalDate>?,
    val progress: Boolean,
    val totals: List<ImportDataTotalRecord>
)

data class ImportDataTotalRecord(
    val currency: String,
    val operation: Amount?,
    val byImport: Amount?,
    val parsed: Amount?,
    val actual: Amount?,
)

data class EntryFilter(
    val date: DateRange? = null,
    val linkage: Boolean? = null,
    val entrySkipped: Boolean? = null,
    val operationSkipped: Boolean? = null,
)

data class ImportDataEntryGroupRecord(
    val date: LocalDate,
    val totals: List<ImportDataTotalRecord>,
    val entries: List<ImportDataEntryRecord>,
)

data class ImportDataEntryRecord(
    val id: UUID? = null,
    val operation: OperationRecord? = null,
    val operationVisible: Boolean = true,
    val parsed: ImportDataOperationRecord? = null,
    val parsedVisible: Boolean = true,
    val suggestions: List<ImportDataOperationRecord> = emptyList(),
)

data class ImportDataOperationRecord(
    val id: UUID? = null,
    val entryId: UUID? = null,
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: AccountRecord?,
    val amountTo: Amount,
    val accountTo: AccountRecord?,
    val selected: Boolean,
    val distance: Double?,
)


//data class ImportDataRecord(
//    val id: UUID,
//    val account: AccountRecord,
//    val entries: List<ImportDataEntryRecord>,
//)
//
//data class ImportDataEntryRecord(
//    val id: UUID,
//    val progress: Boolean,
//    val approved: Boolean,
//    val operationId: UUID?,
//    val date: LocalDate?,
//    val type: OperationType?,
//    val amountFrom: Amount?,
//    val accountFrom: AccountRecord?,
//    val amountTo: Amount?,
//    val accountTo: AccountRecord?,
//    val description: String?,
//    val raw: List<String> = emptyList(),
//)
//
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
//
//data class OperationFilter(
//    val importDataId: UUID,
//    val date: Range<LocalDate>,
//)
//
//data class ImportDataOperationRecord(
//    val id: UUID,
//    val date: LocalDate,
//    val type: OperationType,
//    val amountFrom: Amount,
//    val accountFrom: AccountRecord?,
//    val amountTo: Amount,
//    val accountTo: AccountRecord?,
//    val description: String?,
//    val distance: Double?,
//)
//
//data class LinkOperationRequest(
//    val entryId: UUID,
//    val operationId: UUID,
//)
//
//data class ImportDataEntryDataRecord(
//    val operation: OperationRecord? = null,
//    val parsed: ImportDataOperationRecord? = null,
//    val suggestions: List<ImportDataOperationRecord> = emptyList(),
//)

interface ImportDataDateRange {
    val min: LocalDate
    val max: LocalDate
}