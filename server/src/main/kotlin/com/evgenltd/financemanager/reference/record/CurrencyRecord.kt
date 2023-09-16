package com.evgenltd.financemanager.reference.record

import java.util.*

data class CurrencyRecord(
    val id: UUID?,
    val name: String,
    val crypto: Boolean,
    val style: String? = null
)