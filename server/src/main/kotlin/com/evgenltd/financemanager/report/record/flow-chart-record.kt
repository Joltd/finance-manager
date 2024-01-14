package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.entity.record.EntityFilterNodeRecord
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

class FlowChartSettingsRecord(
    val filter: EntityFilterNodeRecord,
    val total: Boolean,
    val showAverage: Boolean
)

data class FlowChartRecord(
    val dates: List<String>,
    val series: List<FlowChartSeriesRecord>
)

data class FlowChartSeriesRecord(
    val id: String,
    val name: String,
    val values: List<BigDecimal>
)