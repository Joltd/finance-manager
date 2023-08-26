package com.evgenltd.financemanager.reference.record

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import java.util.UUID

data class AccountRecord(
    val id: UUID?,
    val name: String,
    val type: AccountType,
    val deleted: Boolean
)

fun Account.toRecord(): AccountRecord = AccountRecord(
    id = id,
    name = name,
    type = type,
    deleted = deleted
)