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

    operator fun times(other: BigDecimal): Amount = Amount(
            toBigDecimal().multiply(other).toLong(),
            currency
    )

//    operator fun div(other: Number): Amount = Amount(value / other.toLong(), currency)

    operator fun compareTo(other: Amount): Int {
        checkCurrencySame(other)
        return value.compareTo(other.value)
    }

    private fun checkCurrencySame(second: Amount) {
        if (currency != second.currency) {
            throw ArithmeticException("Unable to operate amount with different currencies first=$this, second=$second")
        }
    }

    fun toBigDecimal(): BigDecimal = value.toBigDecimal()
            .movePointLeft(4)

    override fun toString(): String = toBigDecimal()
            .stripTrailingZeros()
            .toPlainString() + " " + currency

}

fun Amount.abs(): Amount = Amount(kotlin.math.abs(value), currency)

fun BigDecimal.toAmountValue(): Long = movePointRight(4).toLong()

fun fromFractionalString(value: String, currency: String): Amount {
    return Amount(
            BigDecimal(value.replace(",",".")).movePointRight(4).toLong(),
            currency
    )
}

fun String.parseAmount(): Amount {
    val parts = this.split(" ")
    if (parts.size != 2) {
        throw IllegalArgumentException("Unable to parse amount [$this]")
    }
    return fromFractionalString(parts[0], parts[1])
}