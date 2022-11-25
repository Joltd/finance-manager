package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowChartRecord(
        val dates: List<LocalDate>,
        val flows: List<FlowChartSeriesRecord>
)