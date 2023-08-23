package com.evgenltd.financemanager.operation.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class OperationFilter(
    val page: Int = 0,
    val size: Int = 50,
    val dateFrom: LocalDate? = null,
    val dateTo: LocalDate? = null,
    val accounts: List<UUID> = emptyList()
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
    val amountFrom: Amount,
    val accountFromId: UUID,
    val accountFromName: String,
    val amountTo: Amount,
    val accountToId: UUID,
    val accountToName: String,
)