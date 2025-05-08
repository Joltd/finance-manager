package com.evgenltd.financemanager.exchangerate.record

import java.math.BigDecimal

data class ExchangeRateResult(
    val rate: BigDecimal,
    val worst: Boolean,
)
