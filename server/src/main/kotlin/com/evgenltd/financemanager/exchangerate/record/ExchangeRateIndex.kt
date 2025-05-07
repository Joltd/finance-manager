package com.evgenltd.financemanager.exchangerate.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.oppositeRate
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import java.math.BigDecimal
import java.time.LocalDate

class ExchangeRateIndex(exchangeRates: List<ExchangeRate>, private val targetCurrency: String, private val deltaDay: Long) {

    private val index: MutableMap<Pair<LocalDate, String>, BigDecimal> = mutableMapOf()
    private val from: LocalDate
    private val to: LocalDate
    private val requests: MutableMap<LocalDate, List<String>> = mutableMapOf()

    init {
        var from: LocalDate = LocalDate.now()
        var to: LocalDate = LocalDate.now()
        if (exchangeRates.isNotEmpty()) {
            from = exchangeRates[0].date
            to = exchangeRates[0].date
        }
        for (exchangeRate in exchangeRates) {
            val (currency, rate) = when (targetCurrency) {
                exchangeRate.to -> (exchangeRate.from to exchangeRate.value)
                exchangeRate.from -> (exchangeRate.to to exchangeRate.value.oppositeRate())
                else -> continue
            }
            index[exchangeRate.date to currency] = rate
            from = from.coerceAtMost(exchangeRate.date)
            to = to.coerceAtLeast(exchangeRate.date)
        }
        this.from = from
        this.to = to
    }

    fun get(date: LocalDate, currency: String): ExchangeRateResult {
        if (currency == targetCurrency) {
            return ExchangeRateResult(BigDecimal.ONE, false)
        }

        index[date to currency]?.let {
            return ExchangeRateResult(it, false)
        }

        for (i: Long in 1..deltaDay) {
            index[date.minusDays(i) to currency]?.let {
                return ExchangeRateResult(it, false)
            }
            index[date.plusDays(i) to currency]?.let {
                return ExchangeRateResult(it, false)
            }
        }

        requests[date] = requests[date].orEmpty() + currency
        return ExchangeRateResult(BigDecimal.ONE, true)
    }

    fun getOpposite(date: LocalDate, currency: String): ExchangeRateResult {
        val result = get(date, currency)
        return ExchangeRateResult(
            rate = result.rate.oppositeRate(),
            worst = result.worst,
        )
    }

    fun get(date: LocalDate, from: String, to: String): ExchangeRateResult {
        if (from == to) {
            return ExchangeRateResult(BigDecimal.ONE, false)
        } else if (to == targetCurrency) {
            return get(date, from)
        } else if (from == targetCurrency) {
            return getOpposite(date, from)
        }

        val toTarget = get(date, from)
        val fromTarget = getOpposite(date, to)
        return ExchangeRateResult(
            (toTarget.rate * fromTarget.rate).setScale(SCALE),
            toTarget.worst || fromTarget.worst,
        )
    }

    private companion object {
        const val SCALE = Amount.SCALE * 2
    }

}