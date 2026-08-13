package com.evgenltd.financemanager.common.util

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class AmountTest {

    @Test
    fun `plus - same currency sums values`() {
        val result = Amount(1000000L, "USD") + Amount(500000L, "USD")

        assertThat(result).isEqualTo(Amount(1500000L, "USD"))
    }

    @Test
    fun `plus - null other returns this unchanged`() {
        val amount = Amount(1000000L, "USD")

        assertThat(amount + null).isEqualTo(amount)
    }

    @Test
    fun `plus - different currency throws ArithmeticException`() {
        assertThatThrownBy { Amount(1000000L, "USD") + Amount(500000L, "EUR") }
            .isInstanceOf(ArithmeticException::class.java)
    }

    @Test
    fun `minus - same currency subtracts values`() {
        val result = Amount(1000000L, "USD") - Amount(300000L, "USD")

        assertThat(result).isEqualTo(Amount(700000L, "USD"))
    }

    @Test
    fun `minus - null other returns this unchanged`() {
        val amount = Amount(1000000L, "USD")

        assertThat(amount - null).isEqualTo(amount)
    }

    @Test
    fun `minus - different currency throws ArithmeticException`() {
        assertThatThrownBy { Amount(1000000L, "USD") - Amount(300000L, "EUR") }
            .isInstanceOf(ArithmeticException::class.java)
    }

    @Test
    fun `unaryMinus - negates value, keeps currency`() {
        assertThat(-Amount(1000000L, "USD")).isEqualTo(Amount(-1000000L, "USD"))
    }

    @Test
    fun `not - is an alias for unaryMinus`() {
        val amount = Amount(1000000L, "USD")

        assertThat(!amount).isEqualTo(-amount)
    }

    @Test
    fun `times - multiplies by BigDecimal and preserves currency`() {
        val result = Amount(1000000L, "USD") * BigDecimal("2.5") // 100.0000 USD * 2.5

        assertThat(result).isEqualTo(Amount(2500000L, "USD")) // 250.0000 USD
    }

    @Test
    fun `div - divides by BigDecimal with HALF_UP rounding`() {
        val result = Amount(1000000L, "USD") / BigDecimal("3") // 100.0000 / 3 = 33.3333...

        assertThat(result).isEqualTo(Amount(333333L, "USD")) // 33.3333 USD
    }

    @Test
    fun `convert - multiplies by rate and switches currency`() {
        val result = Amount(1000000L, "USD").convert(BigDecimal("0.9"), "EUR") // 100.0000 USD

        assertThat(result).isEqualTo(Amount(900000L, "EUR")) // 90.0000 EUR
    }

    @Test
    fun `abs - returns absolute value, keeps currency`() {
        assertThat(Amount(-1000000L, "USD").abs()).isEqualTo(Amount(1000000L, "USD"))
        assertThat(Amount(1000000L, "USD").abs()).isEqualTo(Amount(1000000L, "USD"))
    }

    @Test
    fun `compareTo - compares values within same currency`() {
        assertThat(Amount(1000000L, "USD") > Amount(500000L, "USD")).isTrue()
        assertThat(Amount(500000L, "USD") < Amount(1000000L, "USD")).isTrue()
        assertThat(Amount(500000L, "USD").compareTo(Amount(500000L, "USD"))).isEqualTo(0)
    }

    @Test
    fun `compareTo - different currency throws ArithmeticException`() {
        assertThatThrownBy { Amount(1000000L, "USD").compareTo(Amount(1000000L, "EUR")) }
            .isInstanceOf(ArithmeticException::class.java)
    }

    @Test
    fun `toBigDecimal - moves decimal point left by scale`() {
        assertThat(Amount(1234567L, "USD").toBigDecimal()).isEqualByComparingTo(BigDecimal("123.4567"))
    }

    @Test
    fun `toString - strips trailing zeros and appends currency`() {
        assertThat(Amount(1000000L, "USD").toString()).isEqualTo("100 USD")
        assertThat(Amount(1234500L, "USD").toString()).isEqualTo("123.45 USD")
    }

    @Test
    fun `isZero and isNotZero reflect the raw value`() {
        assertThat(Amount(0L, "USD").isZero()).isTrue()
        assertThat(Amount(0L, "USD").isNotZero()).isFalse()
        assertThat(Amount(1L, "USD").isZero()).isFalse()
        assertThat(Amount(1L, "USD").isNotZero()).isTrue()
    }

    @Test
    fun `isPositive and isNegative reflect the raw value sign`() {
        assertThat(Amount(1L, "USD").isPositive()).isTrue()
        assertThat(Amount(1L, "USD").isNegative()).isFalse()
        assertThat(Amount(-1L, "USD").isPositive()).isFalse()
        assertThat(Amount(-1L, "USD").isNegative()).isTrue()
        assertThat(Amount(0L, "USD").isPositive()).isFalse()
        assertThat(Amount(0L, "USD").isNegative()).isFalse()
    }

    @Test
    fun `round - rounds to given scale with HALF_UP and re-scales to storage value`() {
        val amount = Amount(1234567L, "USD") // 123.4567

        assertThat(amount.round(2)).isEqualTo(Amount(1234600L, "USD")) // 123.46
        assertThat(amount.round(0)).isEqualTo(Amount(1230000L, "USD")) // 123
    }

    @Test
    fun `emptyAmount - is zero value with given currency`() {
        assertThat(emptyAmount("USD")).isEqualTo(Amount(0L, "USD"))
    }

    @Test
    fun `toAmountValue - moves decimal point right by scale`() {
        assertThat(BigDecimal("123.4567").toAmountValue()).isEqualTo(1234567L)
        assertThat(BigDecimal("100").toAmountValue()).isEqualTo(1000000L)
    }

    @Test
    fun `fromFractional - converts a fractional BigDecimal to a scaled Amount`() {
        assertThat(BigDecimal("123.4567").fromFractional("USD")).isEqualTo(Amount(1234567L, "USD"))
    }

    @Test
    fun `fromFractionalString - accepts comma as decimal separator`() {
        assertThat(fromFractionalString("123,45", "USD")).isEqualTo(Amount(1234500L, "USD"))
        assertThat(fromFractionalString("123.45", "USD")).isEqualTo(Amount(1234500L, "USD"))
    }

    @Test
    fun `toAmountValue and toBigDecimal round-trip`() {
        val original = BigDecimal("42.1300")

        assertThat(original.toAmountValue().toBigDecimal().movePointLeft(Amount.SCALE)).isEqualByComparingTo(original)
    }
}
