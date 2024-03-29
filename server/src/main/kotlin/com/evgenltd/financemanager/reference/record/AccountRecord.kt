package com.evgenltd.financemanager.reference.record

import com.evgenltd.financemanager.reference.entity.AccountType
import java.time.LocalDate
import java.util.*

data class AccountRecord(
    val id: UUID?,
    val name: String,
    val type: AccountType,
    val deleted: Boolean,
    val reviseDate: LocalDate?,
)
