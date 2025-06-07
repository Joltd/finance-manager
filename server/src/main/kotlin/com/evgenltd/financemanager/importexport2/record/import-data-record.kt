package com.evgenltd.financemanager.importexport2.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.reference.entity.Account
import java.time.LocalDate
import java.util.UUID

data class ImportDataCreateRequest(
    val account: UUID,
)

data class OperationSuggestion(
    val selected: Boolean,
    val distance: Double,
    val date: LocalDate,
    val type: OperationType,
    val amountFrom: Amount,
    val accountFrom: Account,
    val amountTo: Amount,
    val accountTo: Account,
)