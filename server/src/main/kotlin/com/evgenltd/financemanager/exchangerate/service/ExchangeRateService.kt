package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.service.withMonday
import com.evgenltd.financemanager.common.service.withNextMonday
import com.evgenltd.financemanager.common.util.*
import com.evgenltd.financemanager.exchangerate.converter.ExchangeRateConverter
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRateHistory
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateHistoryIndex
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateIndex
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateHistoryRepository
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters

@Service
class ExchangeRateService(
    private val currencyRepository: CurrencyRepository,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateHistoryRepository: ExchangeRateHistoryRepository,
    private val exchangeRateConverter: ExchangeRateConverter,
    private val publisher: ApplicationEventPublisher,
    private val exchangeRateGatheringService: ExchangeRateGatheringService,
) : Loggable() {

    fun actualRateIndex(targetCurrency: String): ExchangeRateIndex {
        val rates = actualRates()
        return ExchangeRateIndex(targetCurrency, rates)
    }

    fun actualRates(): Map<String, BigDecimal> {
        val currencies = currencyRepository.findAll()
        val rates = exchangeRateRepository.findAll()
        rates.outdated(currencies)
            .isNotEmpty()
            .takeIf { it }
            ?.let { exchangeRateGatheringService.updateActual() }
        return rates.associate { it.currency to it.value }
    }

    fun historyRateIndex(targetCurrency: String, range: Range<LocalDate>, currencies: List<String>): ExchangeRateHistoryIndex {
        val rates = historyRates(range, currencies)
        return ExchangeRateHistoryIndex(targetCurrency, rates)
    }

    fun historyRates(range: Range<LocalDate>, currencies: List<String>): Map<LocalDate, Map<String, BigDecimal>> {
        val actualRange = Range(range.from?.withMonday(), range.to?.withNextMonday())
        return ((ExchangeRateHistory::date between actualRange) and (ExchangeRateHistory::currency contains currencies))
            .let { exchangeRateHistoryRepository.findAll(it) }
            .groupBy { it.date }
            .map { (date, rates) ->
                date to rates.associate { it.currency to it.value }
            }
            .associate { it }
            .also { index ->
                generateSequence(actualRange.from) { it.plusWeeks(1) }
                    .takeWhile { it < actualRange.to }
                    .toList()
                    .onEach { date ->
                        val currencyWithoutRates = currencies - (index[date]?.keys ?: emptySet()).toSet()
                        if (currencyWithoutRates.isNotEmpty()) {
                            exchangeRateGatheringService.updateHistory(date, currencyWithoutRates)
                        }
                    }
            }
    }

//    fun commonRates(currencies: List<String>) {
//        ((ExchangeRate::date between (LocalDate.now().minusDays(DELTA_DAY) until LocalDate.now())) and
//                (
//                        ((ExchangeRate::from contains currencies) and (ExchangeRate::to eq DEFAULT_TARGET_CURRENCY)) or
//                        ((ExchangeRate::from eq  DEFAULT_TARGET_CURRENCY) and (ExchangeRate::to contains currencies))
//                )
//        ).let { exchangeRateRepository.findAll(it) }
//    }

//    fun index(from: LocalDate, to: LocalDate): ExchangeRateIndex {
//        val rates = exchangeRateRepository.findByDateGreaterThanEqualAndDateLessThan(from.minusDays(DELTA_DAY), to.plusDays(DELTA_DAY))
//        return ExchangeRateIndex(rates, DEFAULT_TARGET_CURRENCY, DELTA_DAY)
//    }

//
//    fun rate(date: LocalDate, from: String, to: String): ExchangeRateResult {
//        if (from == to) {
//            return ExchangeRateResult(BigDecimal.ONE, false)
//        }
//
//        val rates = exchangeRateRepository.findByDate(date)
//
//        rates.rate(from, to)?.let {
//            return ExchangeRateResult(it, false)
//        }
//
//        val leftRate = rates.rate(from, DEFAULT_TARGET_CURRENCY)
//        val rightRate = rates.rate(DEFAULT_TARGET_CURRENCY, to)
//        if (leftRate != null && rightRate != null) {
//            return ExchangeRateResult(leftRate * rightRate, false)
//        }
//
//        publisher.publishEvent(ExchangeRateRequestEvent(date, listOf(from, to)))
//        return ExchangeRateResult(BigDecimal.ZERO, true)
//    }
//
//    fun list(): List<ExchangeRateRecord> = exchangeRateRepository.findAll()
//        .map { exchangeRateConverter.toRecord(it) }
//        .sortedBy { it.date }
//
//    fun byId(id: String): ExchangeRateRecord = exchangeRateRepository.find(id)
//        .let { exchangeRateConverter.toRecord(it) }
//
//    fun update(record: ExchangeRateRecord) {
//        if (record.from == record.to) {
//            return
//        }
//        val entity = exchangeRateConverter.toEntity(record)
//        exchangeRateRepository.save(entity)
//    }
//
//    fun delete(id: String) = exchangeRateRepository.deleteById(id)

//    private fun List<ExchangeRate>.rate(from: String, to: String): BigDecimal? = firstOrNull { it.from == from && it.to == to }?.value
//            ?: firstOrNull { it.from == to && it.to == from }?.value?.oppositeRate()

    private companion object {
        const val ACTUAL_RATE_THRESHOLD = 12
//        private const val DELTA_DAY = 2L
//        const val DEFAULT_TARGET_CURRENCY = "USD"
    }

}
