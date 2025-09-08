package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.UUID

data class TopFlowFilter(
    val date: DateRange,
    val type: AccountType? = null,
    val currency: String? = null,
    val categories: List<UUID>? = null,
)

data class TopFlowEntryRecord(
    val date: LocalDate,
    val category1: TopFlowCategoryEntryRecord,
    val category2: TopFlowCategoryEntryRecord,
    val category3: TopFlowCategoryEntryRecord,
    val other: TopFlowCategoryEntryRecord,
)

data class TopFlowCategoryEntryRecord(
    val account: AccountReferenceRecord? = null,
    val amount: Amount,
)