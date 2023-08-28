package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

data class DashboardRecord(
    val defaultCurrencyAmount: Amount,
    val usdCashAmount: Amount?,
    val cashFounds: List<Amount>
)