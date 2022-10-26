package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

class AccountBalanceRecord(
        val account: String?,
        val accountName: String,
        val balances: List<Amount>
)