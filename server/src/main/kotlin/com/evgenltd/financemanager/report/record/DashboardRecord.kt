package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.FundGraphStatus
import java.time.LocalDate

data class DashboardRecord(
    val graphStatus: GraphStatusRecord,
    val funds: List<FundRecord>,
    val fundsTotal: Amount,
    val fundsTotalSecondary: Amount
)

data class GraphStatusRecord(
    val status: FundGraphStatus,
    val date: LocalDate
)

data class FundRecord(
    val amount: Amount,
    val weight: Int
)