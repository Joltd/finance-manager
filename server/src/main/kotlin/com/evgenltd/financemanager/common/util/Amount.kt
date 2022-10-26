package com.evgenltd.financemanager.common.util

import java.math.BigDecimal

data class Amount(val value: Long, val currency: String) {

    operator fun unaryPlus(): Amount = this

    operator fun unaryMinus(): Amount = Amount(-value, currency)

    operator fun not(): Amount = unaryMinus()

    operator fun plus(other: Amount): Amount {
        checkCurrencySame(other)
        return Amount(value + other.value, currency)
    }

    operator fun minus(other: Amount): Amount {
        checkCurrencySame(other)
        return Amount(value + other.value, currency)
    }

    operator fun times(other: Number): Amount = Amount(value * other.toLong(), currency)

    operator fun div(other: Number): Amount = Amount(value / other.toLong(), currency)

    operator fun compareTo(other: Amount): Int {
        checkCurrencySame(other)
        return value.compareTo(other.value)
    }

    private fun checkCurrencySame(second: Amount) {
        if (currency != second.currency) {
            throw ArithmeticException("Unable to operate amount with different currencies first=$this, second=$second")
        }
    }

    override fun toString(): String = value.toBigDecimal()
            .movePointLeft(4)
            .stripTrailingZeros()
            .toPlainString() + currency
}