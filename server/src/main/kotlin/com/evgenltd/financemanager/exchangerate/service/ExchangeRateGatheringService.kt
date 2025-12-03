package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.component.Task
import com.evgenltd.financemanager.common.component.TaskKey
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRateHistory
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateHistoryRepository
import com.evgenltd.financemanager.user.component.withRootTenant
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ExchangeRateGatheringService(
    private val currencyRepository: CurrencyRepository,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateHistoryRepository: ExchangeRateHistoryRepository,
    private val exchangeRateProviderResolver: ExchangeRateProviderResolver,
): Loggable() {

    @Task(root = true)
    fun updateActual() {
        val rates = exchangeRateRepository.findAll()
        val rateIndex = rates.associateBy { it.currency }

        val currencies = currencyRepository.findAll().distinctBy { it.name }
        val outdated = currencies
            .outdated(rates)
        val supported = currencies.map { it.name }

        val fiatRates = outdated.filter { !it.crypto }
            .map { it.name }
            .takeIf { it.isNotEmpty() }
            ?.let { fiat ->
                exchangeRateProviderResolver.resolveFiat()
                    ?.latest(fiat)
                    ?.filter { it.currency in supported }
            }
            ?: emptyList()

        val cryptoRates = outdated.filter { it.crypto }
            .map { it.name }
            .takeIf { it.isNotEmpty() }
            ?.let { crypto ->
                exchangeRateProviderResolver.resolveCrypto()
                    ?.latest(crypto)
                    ?.filter { it.currency in supported }
            }
            ?: emptyList()

        (fiatRates + cryptoRates)
            .map { rate ->
                (rateIndex[rate.currency] ?: ExchangeRate(null, rate.currency, rate.value, null))
                    .also { it.value = rate.value }
            }
            .let { exchangeRateRepository.saveAll(it) }
    }

    @Task(root = true)
    fun updateHistory(@TaskKey date: LocalDate, currencies: List<String> = emptyList()) {
        val allCurrencies = currencyRepository.findAll().distinctBy { it.name }
        val updateCurrencies = allCurrencies.filter { currencies.isEmpty() || it.name in currencies }
        val supported = allCurrencies.map { it.name }

        val rates = exchangeRateHistoryRepository.findAll(ExchangeRateHistory::date eq date)
        val rateIndex = rates.associateBy { it.currency }

        val fiatRates = updateCurrencies.filter { !it.crypto }
            .map { it.name }
            .takeIf { it.isNotEmpty() }
            ?.let { fiat ->
                exchangeRateProviderResolver.resolveFiat()
                    ?.historical(date, fiat)
                    ?.filter { it.currency in supported }
            }
            ?: emptyList()

        val cryptoRates = updateCurrencies.filter { it.crypto }
            .map { it.name }
            .takeIf { it.isNotEmpty() }
            ?.let { crypto ->
                exchangeRateProviderResolver.resolveCrypto()
                    ?.historical(date, crypto)
                    ?.filter { it.currency in supported }
            }
            ?: emptyList()

        (fiatRates + cryptoRates)
            .map { rate ->
                (rateIndex[rate.currency] ?: ExchangeRateHistory(null, date, rate.currency, rate.value))
                    .also { it.value = rate.value }
            }
            .let { exchangeRateHistoryRepository.saveAll(it) }
    }

}