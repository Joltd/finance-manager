package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

data class DashboardRecord(
    val funds: List<FundRecord>,
    val fundsTotal: Amount,
    val fundsTotalSecondary: Amount
)

data class FundRecord(
    val account: String,
    val amount: Amount,
    val commonAmount: Amount
)