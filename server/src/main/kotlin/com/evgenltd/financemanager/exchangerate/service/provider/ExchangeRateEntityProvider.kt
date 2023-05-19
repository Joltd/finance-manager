package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.Period
import kotlin.math.absoluteValue

@Service
@Order(2)
class ExchangeRateEntityProvider(
    private val exchangeRateRepository: ExchangeRateRepository
) : ExchangeRateProvider {

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>, gap: Long): Map<String, BigDecimal> {
        val dateFrom = date.minusDays(gap)
        val dateTo = date.plusDays(gap)
        val rates = exchangeRateRepository.findByDateGreaterThanEqualAndDateLessThan(dateFrom, dateTo)
            .map { Period.between(date, it.date).days.absoluteValue to it }
            .sortedBy { it.first }

        val result = mutableMapOf<String,BigDecimal>()

        for (to in toCurrencies) {
            if (from == to) {
                result[to] = BigDecimal.ONE
                continue
            }

            rates.find { it.second.isMatches(from, to) }
                ?.second
                ?.let { rate ->
                    result[to] = if (rate.from == from && rate.to == to) {
                        rate.value
                    } else {
                        BigDecimal.ONE.divide(rate.value, 10, RoundingMode.HALF_UP)
                    }
                }
        }

        return result
    }

    private fun ExchangeRate.isMatches(from: String, to: String): Boolean =
        this.from == from && this.to == to || this.from == to && this.to == from
}