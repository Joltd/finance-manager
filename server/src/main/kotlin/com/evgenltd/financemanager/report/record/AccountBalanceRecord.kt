package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount

class AccountBalanceRecord(var account: String, var balances: List<Amount>)