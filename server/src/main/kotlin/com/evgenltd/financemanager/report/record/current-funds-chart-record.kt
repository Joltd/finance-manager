package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.record.AccountRecord

data class CurrentFundsChartRecord(
    val entries: List<CurrentFundsChartEntryRecord>
)

data class CurrentFundsChartEntryRecord(
    val account: AccountRecord,
    val amounts: List<Amount>
)