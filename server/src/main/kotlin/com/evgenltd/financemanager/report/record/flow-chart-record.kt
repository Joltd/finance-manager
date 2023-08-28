package com.evgenltd.financemanager.report.record

import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

class FlowChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val categories: List<UUID>,
    val currency: String,
    val total: Boolean,
    val showAverage: Boolean
)

data class FlowChartRecord(
    val dates: List<LocalDate>,
    val averages: List<FLowChartAverageRecord>,
    val series: List<FlowChartSeriesRecord>
)

data class FLowChartAverageRecord(
    val name: String,
    val value: BigDecimal
)

data class FlowChartSeriesRecord(
    val name: String,
    val values: List<BigDecimal>
)