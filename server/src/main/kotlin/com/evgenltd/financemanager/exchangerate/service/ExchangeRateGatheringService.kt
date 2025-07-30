package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRequestEvent
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.reference.entity.Currency
import com.evgenltd.financemanager.reference.repository.CurrencyRepository
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue

@Service
class ExchangeRateGatheringService(
    private val currencyRepository: CurrencyRepository,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateProviderResolver: ExchangeRateProviderResolver,
): Loggable() {

    private val queue: BlockingQueue<ExchangeRateRequestEvent> = LinkedBlockingQueue()

    @EventListener
    @Async
    fun onRequest(event: ExchangeRateRequestEvent) {
        queue.put(event)
    }

//    @Scheduled(cron = "0 0 22 * * *")
    fun processLatest() {

        val now = LocalDate.now()

        val currenciesWithRates = exchangeRateRepository.findByDate(now)
            .mapNotNull {
                if (it.from == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
                    it.to
                } else if (it.to == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
                    it.from
                } else {
                    null
                }
            }
            .toSet()

        currencyRepository.findAll()
            .filter { it.name != ExchangeRateService.DEFAULT_TARGET_CURRENCY }
            .filter { it.name !in currenciesWithRates }
            .groupBy { it.crypto }
            .onEach { (crypto, currencies) ->
                currencies.gatherAndStore(crypto, now) {
                    try {
                        latest(it).also {
                            println(it)
                        }
                    } catch (e: Exception) {
                        log.error("Unable to get latest rates from $name", e)
                        emptyList()
                    }
                }
            }

    }

//    @Scheduled(fixedDelay = 10_000)
    fun processDiscovery() {
        val request = queue.poll() ?: return
        processDiscovery(request)
    }

    fun processDiscovery(request: ExchangeRateRequestEvent) {

        val date = request.date

        val currenciesWithRates = exchangeRateRepository.findByDate(date)
            .mapNotNull {
                if (it.from == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
                    it.to
                } else if (it.to == ExchangeRateService.DEFAULT_TARGET_CURRENCY) {
                    it.from
                } else {
                    null
                }
            }
            .toSet()

        currencyRepository.findAll()
            .filter { it.name != ExchangeRateService.DEFAULT_TARGET_CURRENCY }
            .filter { it.name in request.currencies }
            .filter { it.name !in currenciesWithRates }
            .groupBy { it.crypto }
            .onEach { (crypto, currencies) ->
                currencies.gatherAndStore(crypto, date) {
                    try {
                        historical(date, it)
                    } catch (e: Exception) {
                        log.error("Unable to get historical rates on $date from $name", e)
                        emptyList()
                    }
                }
            }

    }

    private fun List<Currency>.gatherAndStore(crypto: Boolean, date: LocalDate, block: ExchangeRateProvider.(List<String>) -> List<ExchangeRateToDefault>) {
        val currencies = filter { it.crypto == crypto }
            .map { it.name }

        if (currencies.isEmpty()) {
            return
        }

        val provider = if (crypto) {
            exchangeRateProviderResolver.resolveCrypto()
        } else {
            exchangeRateProviderResolver.resolveFiat()
        }

        if (provider == null) {
            return
        }

        provider.block(currencies)
            .filter { it.currency in currencies }
            .onEach {
                exchangeRateRepository.save(ExchangeRate(null, date, ExchangeRateService.DEFAULT_TARGET_CURRENCY, it.currency, it.value))
            }
    }

}