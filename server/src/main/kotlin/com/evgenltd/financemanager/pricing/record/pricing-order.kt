package com.evgenltd.financemanager.pricing.record

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class PricingOrderDefaults(
    val date: LocalDate,
    val currency: String?,
    val country: String,
    val city: String,
    val store: String,
)

data class PricingOrderRecord(
    val id: UUID?,
    val date: LocalDate,
    val item: PricingItemRecord,
    val price: Amount,
    val quantity: BigDecimal,
    val rate: BigDecimal? = null,
    val priceUsd: Amount = Amount(0, "USD"),
    val country: String,
    val city: String,
    val store: String,
    val comment: String?,
)

data class PricingOrderFilter(
    val date: DateRange? = null,
    val item: UUID? = null,
    val country: String? = null,
    val city: String? = null,
    val store: String? = null,
    val page: Int = 0,
    val size: Int = 20,
)