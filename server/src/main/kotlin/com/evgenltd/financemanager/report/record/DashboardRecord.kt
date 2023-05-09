package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

data class DashboardRecord(
    val funds: List<FundRecord>,
    val fundsTotal: Amount,
    val fundsTotalSecondary: Amount
)

data class FundRecord(
    val amount: Amount,
    val weight: Int
)