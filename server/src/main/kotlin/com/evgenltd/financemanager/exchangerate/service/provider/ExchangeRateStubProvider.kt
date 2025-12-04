package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class ExchangeRateStubProvider : ExchangeRateProvider {

    override val name: ExchangeRateProviders = ExchangeRateProviders.STUB

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> = RATES.map {
        ExchangeRateToDefault(it.key, it.value)
    }

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> = RATES.map {
        ExchangeRateToDefault(it.key, it.value)
    }

    companion object {
        val RATES: Map<String,BigDecimal> = mapOf(
            "USD" to BigDecimal(1),
            "GEL" to BigDecimal(2.7),
            "BAM" to BigDecimal(1.674823),
            "EUR" to BigDecimal(0.856656),
            "KZT" to BigDecimal(505.548827),
            "RSD" to BigDecimal(100.575703),
            "RUB" to BigDecimal(76.451962),
            "SEK" to BigDecimal(9.39634),
            "TRY" to BigDecimal(42.450255),
            "TRX" to BigDecimal(3.52787195),
            "ETH" to BigDecimal(0.00031464),
        )
    }

}