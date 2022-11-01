package com.evgenltd.financemanager.report.record

import java.time.LocalDate

class FlowRecord(
        val dates: List<LocalDate>,
        val expenses: List<FlowSeriesRecord>,
        val totalExpense: FlowSeriesRecord,
        val incomes: List<FlowSeriesRecord>
)