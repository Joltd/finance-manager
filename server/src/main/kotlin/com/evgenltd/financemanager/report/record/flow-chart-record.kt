package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.entity.record.EntityFilterNodeRecord
import java.math.BigDecimal
import java.time.LocalDate

class FlowChartSettingsRecord(
    val filter: EntityFilterNodeRecord,
    val category: Boolean,
    val showAverage: Boolean
)

data class FlowChartRecord(
    val groups: List<FlowChartGroupRecord>,
)

data class FlowChartGroupRecord(
    val date: LocalDate,
    val entries: List<FlowChartEntryRecord>,
)

data class FlowChartEntryRecord(
    val id: String,
    val name: String,
    val value: BigDecimal,
)
