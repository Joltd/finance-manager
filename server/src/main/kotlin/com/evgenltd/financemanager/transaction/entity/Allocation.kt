package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import java.util.*

data class Allocation(
    val transaction: String,
    var amount: Amount
)

class AllocationQueue: LinkedList<Allocation>() {
    fun add(transaction: String, amount: Amount) {
        add(Allocation(transaction, amount))
    }
}
