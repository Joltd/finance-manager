package com.evgenltd.financemanager.common.util

import jakarta.persistence.Embeddable
import java.math.BigDecimal
import kotlin.math.absoluteValue

@Embeddable
data class Amount(val value: Long, val currency: String) : Comparable<Amount> {

    operator fun unaryPlus(): Amount = this

    operator fun unaryMinus(): Amount = Amount(-value, currency)

    operator fun not(): Amount = unaryMinus()

    operator fun plus(other: Amount?): Amount {
        if (other == null) {
            return this
        }
        checkCurrencySame(other)
        return Amount(value + other.value, currency)
    }

    operator fun minus(other: Amount?): Amount {
        if (other == null) {
            return this
        }
        checkCurrencySame(other)
        return Amount(value - other.value, currency)
    }

    operator fun times(other: BigDecimal): Amount = Amount(
        toBigDecimal().multiply(other).toAmountValue(),
        currency
    )

    fun convert(rate: BigDecimal, currency: String): Amount = Amount(
        toBigDecimal().multiply(rate).toAmountValue(),
        currency
    )

    fun abs(): Amount = Amount(value.absoluteValue, currency)

//    operator fun div(other: Number): Amount = Amount(value / other.toLong(), currency)

    override operator fun compareTo(other: Amount): Int {
        checkCurrencySame(other)
        return value.compareTo(other.value)
    }

    private fun checkCurrencySame(that: Amount) {
        if (this.currency != that.currency) {
            throw ArithmeticException("Unable to operate amount with different currencies first=$this, second=$that")
        }
    }

    fun toBigDecimal(): BigDecimal = value.toBigDecimal()
            .movePointLeft(SCALE)

    override fun toString(): String = toBigDecimal()
            .stripTrailingZeros()
            .toPlainString() + " " + currency

    companion object {
        const val SCALE = 4
    }

}

fun Amount.isZero(): Boolean = value == 0L

fun Amount.isNotZero(): Boolean = value != 0L

fun Amount.isPositive(): Boolean = value > 0L

fun Amount.isNegative(): Boolean = value < 0L

fun emptyAmount(currency: String): Amount = Amount(0, currency)

fun BigDecimal.toAmountValue(): Long = movePointRight(Amount.SCALE).toLong()

fun BigDecimal.fromFractional(currency: String): Amount = Amount(
    movePointRight(Amount.SCALE).toLong(),
    currency
)

fun fromFractionalString(value: String, currency: String): Amount = Amount(
    BigDecimal(value.replace(",",".")).movePointRight(Amount.SCALE).toLong(),
    currency
)
