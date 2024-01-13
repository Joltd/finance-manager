package com.evgenltd.financemanager.pricing.record

import com.evgenltd.financemanager.common.util.Amount
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class PricingOrderDefaults(
    val country: String,
    val store: String,
)

data class PricingOrderRecord(
    val id: UUID?,
    val date: LocalDate,
    val item: PricingItemRecord,
    val price: Amount,
    val quantity: BigDecimal,
    val country: String,
    val store: String,
    val comment: String?,
)