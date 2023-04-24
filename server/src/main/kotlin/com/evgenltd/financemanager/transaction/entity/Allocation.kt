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

    fun sum(currency: String): Amount = if (isEmpty()) Amount(0, currency)
    else map { it.amount }.reduce { acc, amount -> acc + amount }
}
