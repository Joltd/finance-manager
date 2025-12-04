package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.provider.ExchangeRateProviders
import java.time.LocalDate

interface ExchangeRateProvider {

    @SkipLogging
    val name: ExchangeRateProviders

    fun latest(currencyHints: List<String>): List<ExchangeRateToDefault>

    fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault>

}