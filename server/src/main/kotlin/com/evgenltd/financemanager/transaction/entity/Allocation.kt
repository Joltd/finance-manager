package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import java.util.*

data class Allocation(
    val transaction: String,
    var amount: Amount
)

data class AllocationKey(
    val account: String,
    val currency: String
)

class AllocationQueue: LinkedList<Allocation>() {
    fun add(transaction: String, amount: Amount) {
        add(Allocation(transaction, amount))
    }
}
