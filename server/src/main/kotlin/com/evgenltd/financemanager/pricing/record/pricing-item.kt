package com.evgenltd.financemanager.pricing.record

import java.math.BigDecimal
import java.util.UUID

data class PricingItemRecord(
    val id: UUID?,
    val name: String = "",
    var category: String = "",
    var unit: String = "",
    var defaultQuantity: BigDecimal = BigDecimal.ONE,
)

data class PricingItemFilter(
    val name: String? = null,
    val category: String? = null,
    val unit: String? = null,
    val page: Int = 0,
    val size: Int = 20,
)