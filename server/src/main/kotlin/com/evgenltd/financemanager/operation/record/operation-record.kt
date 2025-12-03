package com.evgenltd.financemanager.operation.record

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.ai.record.EmbeddingRecord
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import java.time.LocalDate
import java.util.*

data class OperationFilter(
    val date: DateRange,
    val type: OperationType? = null,
    val account: UUID? = null,
    val category: UUID? = null,
    val currency: String? = null,
)

data class OperationGroupRecord(
    val date: LocalDate,
    val operations: List<OperationRecord> = emptyList(),
)

data class OperationRecord(
    val id: UUID?,
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: AccountRecord,
    val amountTo: Amount,
    val accountTo: AccountRecord,
    val description: String?,
    val raw: List<String> = emptyList(),
    val hint: EmbeddingRecord? = null,
)

data class OperationChangeRecord(
    val old: OperationChangeStateRecord?,
    val new: OperationChangeStateRecord?,
)

data class OperationChangeStateRecord(
    val id: UUID,
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: UUID,
    val accountFromType: AccountType,
    val amountTo: Amount,
    val accountTo: UUID,
    val accountToType: AccountType,
)

data class AccountBalanceChangeStateRecord(
    val account: UUID,
    val currency: String,
    val date: LocalDate,
)