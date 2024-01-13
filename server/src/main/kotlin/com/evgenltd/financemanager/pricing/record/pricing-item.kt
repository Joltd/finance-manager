package com.evgenltd.financemanager.pricing.record

import java.math.BigDecimal
import java.util.UUID

data class PricingItemRecord(
    val id: UUID?,
    val name: String,
    var category: String,
    var unit: String,
    var defaultQuantity: BigDecimal,
)