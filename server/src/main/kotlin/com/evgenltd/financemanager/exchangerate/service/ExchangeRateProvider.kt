package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.provider.Provider
import java.time.LocalDate

interface ExchangeRateProvider {

    val name: Provider

    fun latest(currencyHints: List<String>): List<ExchangeRateToDefault>

    fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault>

}