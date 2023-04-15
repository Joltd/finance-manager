package com.evgenltd.financemanager.transaction.record

data class FlowsRecord(
    val incomes: List<FlowRecord>,
    val expenses: List<FlowRecord>
)
