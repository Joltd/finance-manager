package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import java.math.BigDecimal
import java.time.LocalDate

class StubProvider : ExchangeRateProvider {

    override val name: Provider = Provider.STUB

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> = emptyList()

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> = emptyList()

    companion object {
        val RATES: Map<String,BigDecimal> = mapOf(
            "GELUSD" to BigDecimal("0.38"),
            "KZTUSD" to BigDecimal("0.0022"),
        )
    }

}