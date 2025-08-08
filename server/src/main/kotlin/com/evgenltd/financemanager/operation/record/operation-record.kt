package com.evgenltd.financemanager.operation.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.common.record.Reference
import org.springframework.context.ApplicationEvent
import java.time.LocalDate
import java.util.*

data class OperationFilter(
    val page: Int = 0,
    val size: Int = 50,
    val dateFrom: LocalDate? = null,
    val dateTo: LocalDate? = null,
    val type: OperationType? = null,
    val account: Reference? = null,
    val category: Reference? = null,
    val currency: String? = null,
)

data class OperationPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val operations: List<OperationRecord>
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
)

interface AccountScore {
    val accountId: UUID
    val score: Double
}

data class OperationEvent(
    val entries: List<OperationEventEntry> = emptyList(),
) : ApplicationEvent(entries)

data class OperationEventEntry(
    val old: Operation? = null,
    val new: Operation? = null,
)