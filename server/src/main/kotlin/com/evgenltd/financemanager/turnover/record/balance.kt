package com.evgenltd.financemanager.turnover.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.AccountRecord
import org.springframework.context.ApplicationEvent
import java.time.LocalDate
import java.util.*

data class BalanceRecord(
    val id: UUID,
    val account: AccountRecord,
    val amount: Amount,
    val date: LocalDate,
    val progress: Boolean,
)

data class InvalidateBalanceEvent(val account: Account, val currency: String, val date: LocalDate) : ApplicationEvent(account)