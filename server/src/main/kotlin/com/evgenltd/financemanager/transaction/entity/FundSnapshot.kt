package com.evgenltd.financemanager.transaction.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

@Document("fund_snapshot")
class FundSnapshot(
    @Id
    var id: String?,
    var date: LocalDate,
    var type: FundSnapshotType,
    var fund: Fund
)

enum class FundSnapshotType {
    CURRENT,
    HISTORY
}

class Fund : HashMap<AllocationKey, AllocationQueue>() {

    fun get(account: String, currency: String): AllocationQueue =
        getOrPut(AllocationKey(account, currency)) { AllocationQueue() }

}
