package com.evgenltd.financemanager.candy.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.*

data class CandyDashboardRecord(
    val balance: Amount,
    val balanceUsd: Amount,
    val lastExpenses: List<CandyExpenseRecord>
)

data class CandyExpenseRecord(
    val id: UUID?,
    val date: LocalDate,
    val amount: Amount,
    val amountUsd: Amount?,
    val comment: String?
)