package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import java.time.LocalDate
import java.util.*

data class ImportDataCreateRequest(
    val account: UUID,
    val currency: String?,
)

data class ImportDataRecord(
    val id: UUID,
    val account: AccountReferenceRecord,
    val currency: String?,
    val dateRange: Range<LocalDate>?,
    val parsingStatus: ImportDataParsingStatus,
    val message: String?,
    val valid: Boolean,
    val totals: List<ImportDataTotalRecord>
)

data class ImportDataTotalRecord(
    val currency: String,
    val parsed: Amount,
    val suggested: Amount,
    val operation: Amount,
    val actual: Amount,
    val balance: Amount,
    val valid: Boolean,
)

data class ImportDataParsedEntry(
    val raw: String,
    val date: LocalDate?,
    val direction: TransactionDirection?,
    val amount: String?,
    val currency: String?,
    val transactionId: String?,
    val mcc: String?,
    val bankType: String?,
    val bankCategory: String?,
    val merchant: String?,
    val counterparty: String?,
    val purpose: String?,
    val description: String?,
    val message: String?,
)

interface ImportDataDateRange {
    val min: LocalDate?
    val max: LocalDate?
}
