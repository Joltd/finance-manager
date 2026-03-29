package com.evgenltd.financemanager.account.record

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class AccountRecord(
    val id: UUID?,
    val name: String,
    val type: AccountType,
    val parser: String?,
    val deleted: Boolean,
    val reviseDate: LocalDate?,
    val reportExclude: Boolean = false,
    val externalId: String? = null,
)

data class AccountReferenceRecord(
    val id: UUID,
    val name: String,
    val deleted: Boolean,
    val type: AccountType,
    val reviseDate: LocalDate?,
)

data class AccountBalanceFilter(
    val hideZeroBalances: Boolean = false,
)

data class AccountBalanceRecord(
    val account: AccountReferenceRecord,
    val balances: List<Amount>,
)
