package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.record.AccountRecord

data class CurrentFundsChartSettingsRecord(
    val currency: String?
)

data class CurrentFundsChartRecord(
    val entries: List<CurrentFundsChartEntryRecord>
)

data class CurrentFundsChartEntryRecord(
    val account: AccountRecord,
    val commonAmount: Amount,
    val amounts: List<CurrentFundsChartAmountEntryRecord>
)

data class CurrentFundsChartAmountEntryRecord(
    val amount: Amount,
    val commonAmount: Amount
)