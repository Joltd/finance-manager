package com.evgenltd.financemanager.common.util

import jakarta.persistence.Embeddable
import java.math.BigDecimal
import kotlin.math.absoluteValue

@Embeddable
data class Amount(val value: Long, val currency: String) {

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
        this.currency == that.currency && (this.value - that.value).absoluteValue < this.value / 10

    fun isZero(): Boolean = value == 0L

    fun isNotZero(): Boolean = value != 0L

    fun isPositive(): Boolean = value > 0L

    fun isNegative(): Boolean = value < 0L

    fun toBigDecimal(): BigDecimal = value.toBigDecimal()
            .movePointLeft(SCALE)

    override fun toString(): String = toBigDecimal()
            .stripTrailingZeros()
            .toPlainString() + " " + currency

    companion object {
        const val SCALE = 4
    }

}

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

fun String.parseAmount(): Amount {
    val parts = this.split(" ")
    if (parts.size != 2) {
        throw IllegalArgumentException("Unable to parse amount [$this]")
    }
    return fromFractionalString(parts[0], parts[1])
}

fun <T> Iterable<T>.sumOf(selector: (T) -> Amount): Amount = map { selector(it) }.reduce { acc, amount -> acc + amount }