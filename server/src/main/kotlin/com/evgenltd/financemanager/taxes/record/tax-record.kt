package com.evgenltd.financemanager.taxes.record

import com.evgenltd.financemanager.common.util.Amount
import java.math.BigDecimal
import java.time.LocalDate

data class NewTax(
    val date: LocalDate,
    val base: Amount,
    val rate: BigDecimal,
    val amount: Amount,
)