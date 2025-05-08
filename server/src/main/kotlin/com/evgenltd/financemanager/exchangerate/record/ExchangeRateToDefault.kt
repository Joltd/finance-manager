package com.evgenltd.financemanager.exchangerate.record

import java.math.BigDecimal

data class ExchangeRateToDefault(
    val currency: String,
    val value: BigDecimal,
)
