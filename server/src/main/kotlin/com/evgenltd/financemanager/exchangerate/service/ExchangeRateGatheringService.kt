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
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ExchangeRateGatheringService(
    private val currencyRepository: CurrencyRepository,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateHistoryRepository: ExchangeRateHistoryRepository,
    private val exchangeRateProviderResolver: ExchangeRateProviderResolver,
): Loggable() {

    @Task
    fun updateActual() {
        val rates = exchangeRateRepository.findAll()
        val rateIndex = rates.associateBy { it.currency }

        val currencies = currencyRepository.findAll()
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

    @Task
    fun updateHistory(@TaskKey date: LocalDate, currencies: List<String> = emptyList()) {
        val allCurrencies = currencyRepository.findAll()
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

//    private val queue: BlockingQueue<ExchangeRateRequestEvent> = LinkedBlockingQueue()

//    @EventListener
//    @Async
//    fun onRequest(event: ExchangeRateRequestEvent) {
//        queue.put(event)
//    }

//    @Scheduled(cron = "0 0 22 * * *")
//    fun processLatest() {
//
//        val now = LocalDate.now()
//
//        val currenciesWithRates = exchangeRateRepository.findByDate(now)
//            .mapNotNull {
//                if (it.from == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
//                    it.to
//                } else if (it.to == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
//                    it.from
//                } else {
//                    null
//                }
//            }
//            .toSet()
//
//        currencyRepository.findAll()
//            .filter { it.name != ExchangeRateService.DEFAULT_TARGET_CURRENCY }
//            .filter { it.name !in currenciesWithRates }
//            .groupBy { it.crypto }
//            .onEach { (crypto, currencies) ->
//                currencies.gatherAndStore(crypto, now) {
//                    try {
//                        latest(it).also {
//                            println(it)
//                        }
//                    } catch (e: Exception) {
//                        log.error("Unable to get latest rates from $name", e)
//                        emptyList()
//                    }
//                }
//            }
//
//    }

//    @Scheduled(fixedDelay = 10_000)
//    fun processDiscovery() {
//        val request = queue.poll() ?: return
//        processDiscovery(request)
//    }
//
//    fun processDiscovery(request: ExchangeRateRequestEvent) {
//
//        val date = request.date
//
//        val currenciesWithRates = exchangeRateRepository.findByDate(date)
//            .mapNotNull {
//                if (it.from == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
//                    it.to
//                } else if (it.to == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
//                    it.from
//                } else {
//                    null
//                }
//            }
//            .toSet()
//
//        currencyRepository.findAll()
//            .filter { it.name != ExchangeRateService.DEFAULT_TARGET_CURRENCY }
//            .filter { it.name in request.currencies }
//            .filter { it.name !in currenciesWithRates }
//            .groupBy { it.crypto }
//            .onEach { (crypto, currencies) ->
//                currencies.gatherAndStore(crypto, date) {
//                    try {
//                        historical(date, it)
//                    } catch (e: Exception) {
//                        log.error("Unable to get historical rates on $date from $name", e)
//                        emptyList()
//                    }
//                }
//            }
//
//    }
//
//    private fun List<Currency>.gatherAndStore(crypto: Boolean, date: LocalDate, block: ExchangeRateProvider.(List<String>) -> List<ExchangeRateToDefault>) {
//        val currencies = filter { it.crypto == crypto }
//            .map { it.name }
//
//        if (currencies.isEmpty()) {
//            return
//        }
//
//        val provider = if (crypto) {
//            exchangeRateProviderResolver.resolveCrypto()
//        } else {
//            exchangeRateProviderResolver.resolveFiat()
//        }
//
//        if (provider == null) {
//            return
//        }
//
//        provider.block(currencies)
//            .filter { it.currency in currencies }
//            .onEach {
//                exchangeRateRepository.save(ExchangeRate(null, date, ExchangeRateService.DEFAULT_TARGET_CURRENCY, it.currency, it.value))
//            }
//    }

}