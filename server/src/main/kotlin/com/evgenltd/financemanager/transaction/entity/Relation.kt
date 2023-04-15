package com.evgenltd.financemanager.transaction.entity

import com.evgenltd.financemanager.common.util.Amount
import java.math.BigDecimal
import java.time.LocalDate

class Relation(
    var id: String?,
    var date: LocalDate,
    var from: String,
    var to: String,
    var document: String? = null,
    var exchange: Boolean,
    var amount: Amount? = null,
    var rate: BigDecimal? = null
) {

    fun amount(): Amount {
        if (exchange) {
            throw IllegalStateException("Exchange relation doesn't have amount")
        }
        return amount!!
    }

    fun rate(): BigDecimal {
        if (!exchange) {
            throw IllegalStateException("Non-exchange relation doesn't have rate")
        }
        return rate!!
    }

}