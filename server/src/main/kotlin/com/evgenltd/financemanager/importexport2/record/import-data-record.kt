package com.evgenltd.financemanager.importexport2.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import java.time.LocalDate
import java.util.UUID

data class ImportDataCreateRequest(
    val account: UUID,
)

data class ImportDataRecord(
    val id: UUID,
    val account: AccountRecord,
    val entries: List<ImportDataEntryRecord>,
)

data class ImportDataEntryRecord(
    val id: UUID,
    val progress: Boolean,
    val approved: Boolean,
    val data: LocalDate?,
    val type: OperationType?,
    val amountFrom: Amount?,
    val accountFrom: AccountRecord?,
    val amountTo: Amount?,
    val accountTo: AccountRecord?,
    val description: String?,
    val raw: List<String> = emptyList(),
)
