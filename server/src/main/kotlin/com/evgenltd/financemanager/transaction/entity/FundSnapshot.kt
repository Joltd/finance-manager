package com.evgenltd.financemanager.transaction.entity

import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate

@Document("fundSnapshot")
class FundSnapshot(
    var id: String?,
    var date: LocalDate,
    var fund: Fund,
)

class Fund : HashMap<String, AllocationQueue>() {

    fun get(account: String, currency: String): AllocationQueue =
        getOrPut(key(account, currency)) { AllocationQueue() }

    fun remove(account: String, currency: String) =
        remove(key(account, currency))

    private fun key(account: String, currency: String): String = "${account}_${currency}"

    companion object {
        fun account(key: String): String = key.split("_")[0]

        fun currency(key: String): String = key.split("_")[1]
    }

}
