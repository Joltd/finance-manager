package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.operation.entity.TransactionType
import java.time.LocalDate
import java.util.UUID

class FlowChartSettingsRecord(
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val type: TransactionType?,
    val categories: List<UUID>,
    val commonCurrency: String
)