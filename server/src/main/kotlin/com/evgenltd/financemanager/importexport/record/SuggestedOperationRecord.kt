package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import java.time.LocalDate
import java.util.UUID

data class SuggestedOperationRecord(
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: UUID,
    val amountTo: Amount,
    val accountTo: UUID,
    val description: String,
)