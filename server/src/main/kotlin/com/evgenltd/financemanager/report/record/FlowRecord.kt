package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowRecord(
        val dates: List<LocalDate>,
        val flows: List<FlowSeriesRecord>
)