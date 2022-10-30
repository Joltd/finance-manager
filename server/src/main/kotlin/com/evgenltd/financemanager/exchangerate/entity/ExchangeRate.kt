package com.evgenltd.financemanager.exchangerate.entity

import java.math.BigDecimal
import java.time.LocalDate

class ExchangeRate(
        var id: String?,
        var date: LocalDate,
        var from: String,
        var to: String,
        var value: BigDecimal
)