package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import java.math.BigDecimal
import java.time.LocalDate

abstract class LimitedExchangeRateProvider(
    private val exchangeRateRepository: ExchangeRateRepository
) : ExchangeRateProvider, Loggable() {

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>, gap: Long): Map<String, BigDecimal> =
        try {
            log.info("Load rate $from/$toCurrencies for date $date")
            rate(date, from, toCurrencies)
                .onEach { (to, rate) ->
                    exchangeRateRepository.save(ExchangeRate(null, date, from, to, rate))
                }
        } catch (e: Exception) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies", e)
            emptyMap()
        }

    abstract fun rate(date: LocalDate, from: String, toCurrencies: Set<String>): Map<String, BigDecimal>


}