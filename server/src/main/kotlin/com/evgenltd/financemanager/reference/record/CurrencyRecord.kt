package com.evgenltd.financemanager.reference.record

import java.util.UUID

data class CurrencyRecord(
    val id: UUID?,
    val name: String,
    val crypto: Boolean,
)