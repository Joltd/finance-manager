package com.evgenltd.financemanager.report.record

import java.math.BigDecimal
import java.time.LocalDate

data class CumulativeFundsChartSettingsRecord(
    val dateFrom: LocalDate,
    val currency: String
)

data class CumulativeFundsChartRecord(
    val dates: List<LocalDate>,
    val values: List<BigDecimal>
)
