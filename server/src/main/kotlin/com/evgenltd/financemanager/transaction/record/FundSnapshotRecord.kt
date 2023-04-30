package com.evgenltd.financemanager.transaction.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.reference.record.Reference
import java.time.LocalDate

data class FundSnapshotRecord(
    val id: String,
    val date: LocalDate,
    val accounts: List<FundSnapshotAccountRecord>
)

data class FundSnapshotAccountRecord(
    val account: Reference,
    val allocationQueues: List<AllocationQueueRecord>
)

data class AllocationQueueRecord(
    val amount: Amount,
    val allocations: List<AllocationRecord>
)

data class AllocationRecord(
    val document: DocumentTypedRecord,
    val amount: Amount,
    val weight: Int

)