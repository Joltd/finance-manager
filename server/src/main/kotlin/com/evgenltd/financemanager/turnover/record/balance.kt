package com.evgenltd.financemanager.turnover.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.account.record.AccountRecord
import java.time.LocalDate
import java.util.*

data class BalanceRecord(
    val id: UUID,
    val account: AccountRecord,
    val amount: Amount,
    val date: LocalDate,
    val progress: Boolean,
)
