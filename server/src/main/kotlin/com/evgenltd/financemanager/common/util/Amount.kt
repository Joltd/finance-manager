package com.evgenltd.financemanager.common.util

import java.math.BigDecimal

data class Amount(val value: Long, val currency: String) {

    override fun toString(): String = value.toBigDecimal()
            .movePointLeft(4)
            .toPlainString() + currency
}