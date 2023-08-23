package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import java.util.UUID

data class DashboardRecord(
    val funds: List<FundRecord>,
    val fundsTotal: Amount,
    val fundsTotalSecondary: Amount
)

data class FundRecord(
    val account: UUID,
    val amount: Amount,
    val commonAmount: Amount
)