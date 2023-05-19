package com.evgenltd.financemanager.exchangerate.record

import java.math.BigDecimal
import java.time.LocalDate

data class ExchangeRateRecord(
    val id: String?,
    val date: LocalDate,
    val from: String,
    val to: String,
    val value: BigDecimal
)