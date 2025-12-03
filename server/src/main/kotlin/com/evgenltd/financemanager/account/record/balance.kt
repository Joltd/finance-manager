package com.evgenltd.financemanager.account.record

import com.evgenltd.financemanager.common.util.Amount
import org.springframework.context.ApplicationEvent
import java.time.LocalDate
import java.util.*

data class BalanceRecord(
    val id: UUID,
    val account: AccountRecord,
    val amount: Amount,
    val date: LocalDate,
)

data class BalanceCommonRecord(
    val account: AccountReferenceRecord,
    val amount: Amount,
    val commonAmount: Amount,
)

data class BalanceUpdateEvent(
    val accountId: UUID,
    val date: LocalDate,
) : ApplicationEvent(accountId)