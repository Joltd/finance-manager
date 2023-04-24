package com.evgenltd.financemanager.exchangerate.service

import java.math.BigDecimal
import java.time.LocalDate

interface ExchangeRateProvider {

    fun rate(date: LocalDate, from: String, toCurrencies: Set<String>, gap: Long = SHORT_PERIOD_GAP): Map<String,BigDecimal>

    companion object {
        const val SHORT_PERIOD_GAP = 3L
        const val LONG_PERIOD_GAP = 7L
    }

}