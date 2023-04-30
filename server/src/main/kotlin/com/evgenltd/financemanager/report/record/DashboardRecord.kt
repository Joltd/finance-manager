package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.record.GraphStateRecord

data class DashboardRecord(
    val graph: GraphStateRecord,
    val funds: List<FundRecord>,
    val fundsTotal: Amount,
    val fundsTotalSecondary: Amount
)

data class FundRecord(
    val amount: Amount,
    val weight: Int
)