package com.evgenltd.financemanager.common.util

import jakarta.persistence.Embeddable
import java.math.BigDecimal
import kotlin.math.absoluteValue

@Embeddable
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
        return Amount(value - other.value, currency)
    }

    operator fun times(other: BigDecimal): Amount = Amount(
            toBigDecimal().multiply(other).toAmountValue(),
            currency
    )

    fun abs(): Amount = Amount(value.absoluteValue, currency)

//    operator fun div(other: Number): Amount = Amount(value / other.toLong(), currency)

    operator fun compareTo(other: Amount): Int {
        checkCurrencySame(other)
        return value.compareTo(other.value)
    }

    private fun checkCurrencySame(that: Amount) {
        if (this.currency != that.currency) {
            throw ArithmeticException("Unable to operate amount with different currencies first=$this, second=$that")
        }
    }

    fun isSimilar(that: Amount): Boolean =
        this.currency == that.currency
                && (this.value - that.value).absoluteValue < this.value / 106

    fun toBigDecimal(): BigDecimal = value.toBigDecimal()
            .movePointLeft(4)

    override fun toString(): String = toBigDecimal()
            .stripTrailingZeros()
            .toPlainString() + " " + currency

}

fun emptyAmount(currency: String): Amount = Amount(0, currency)

fun BigDecimal.toAmountValue(): Long = movePointRight(4).toLong()

fun BigDecimal.fromFractional(currency: String): Amount = Amount(
    movePointRight(4).toLong(),
    currency
)

fun fromFractionalString(value: String, currency: String): Amount = Amount(
    BigDecimal(value.replace(",",".")).movePointRight(4).toLong(),
    currency
)

fun String.parseAmount(): Amount {
    val parts = this.split(" ")
    if (parts.size != 2) {
        throw IllegalArgumentException("Unable to parse amount [$this]")
    }
    return fromFractionalString(parts[0], parts[1])
}