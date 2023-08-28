package com.evgenltd.financemanager.exchangerate.record

import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

data class ExchangeRateRecord(
    val id: UUID?,
    val date: LocalDate,
    val from: String,
    val to: String,
    val value: BigDecimal
)