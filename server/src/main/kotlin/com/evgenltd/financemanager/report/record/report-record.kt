package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.UUID

data class TopFlowFilter(
    val date: DateRange,
    val type: AccountType? = null,
    val exclude: List<UUID>? = null,
    val include: List<UUID>? = null,
)

data class TopFlowReportRecord(
    val groups: List<TopFlowGroupRecord> = emptyList(),
)

data class TopFlowGroupRecord(
    val date: LocalDate,
    val amount: Amount,
    val entries: List<TopFlowEntryRecord>,
    val otherEntries: List<TopFlowEntryRecord> = emptyList(),
)

data class TopFlowEntryRecord(
    val other: Boolean = false,
    val account: Reference? = null,
    val amount: Amount,
)

data class IncomeExpenseFilter(
    val date: DateRange,
)

data class IncomeExpenseReportRecord(
    val groups: List<IncomeExpenseGroupRecord> = emptyList(),
)

data class IncomeExpenseGroupRecord(
    val date: LocalDate,
    val entries: List<IncomeExpenseEntryRecord> = emptyList(),
)

data class IncomeExpenseEntryRecord(
    val type: AccountType,
    val amount: Amount,
)

data class BalanceChartRecord(
    val groups: List<BalanceGroupRecord>,
    val otherGroups: List<BalanceGroupRecord>,
)

data class BalanceGroupRecord(
    val other: Boolean = false,
    val group: Reference? = null,
    val amount: Amount,
    val entries: List<BalanceAccountRecord> = emptyList(),
)

data class BalanceAccountRecord(
    val account: Reference,
    val amount: Amount,
)