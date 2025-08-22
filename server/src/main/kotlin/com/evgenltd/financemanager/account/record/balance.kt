package com.evgenltd.financemanager.account.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class BalanceRecord(
    val id: UUID,
    val account: AccountRecord,
    val amount: Amount,
    val date: LocalDate,
    val progress: Boolean,
)

data class BalanceCommonRecord(
    val account: AccountReferenceRecord,
    val amount: Amount,
    val commonAmount: Amount,
)
