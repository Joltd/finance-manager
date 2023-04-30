package com.evgenltd.financemanager.transaction.record

import com.evgenltd.financemanager.transaction.entity.GraphStatus
import java.time.LocalDate

data class GraphStateRecord(
    val status: GraphStatus,
    val date: LocalDate,
    val error: String? = null,
    val accounts: List<FundSnapshotAccountRecord> = emptyList()
)