package com.evgenltd.financemanager.account.record

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class AccountGroupRecord(
    val id: UUID?,
    val name: String,
)

data class AccountRecord(
    val id: UUID?,
    val name: String,
    val type: AccountType,
    val group: AccountGroupRecord?,
    val deleted: Boolean,
    val reviseDate: LocalDate?,
)

data class AccountGroupEntryRecord(
    val id: UUID,
    val name: String,
    val accounts: List<AccountRecord>,
)

data class AccountBalanceFilter(
    val hideZeroBalances: Boolean = false,
)

data class AccountBalanceGroupRecord(
    val id: UUID?,
    val name: String?,
    val accounts: List<AccountBalanceRecord>,
)

data class AccountBalanceRecord(
    val id: UUID,
    val name: String,
    val balances: List<Amount>,
)
