package com.evgenltd.financemanager.transaction.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

data class FlowRecord(
    val date: LocalDate,
    val amount: Amount,
    val category: String
)