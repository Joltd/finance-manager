package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.*
import com.evgenltd.financemanager.exchangerate.converter.ExchangeRateConverter
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateIndex
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRequestEvent
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateResult
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class ExchangeRateService(
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateConverter: ExchangeRateConverter,
    private val publisher: ApplicationEventPublisher,
) : Loggable() {

    fun index(from: LocalDate, to: LocalDate): ExchangeRateIndex {
        val rates = exchangeRateRepository.findByDateGreaterThanEqualAndDateLessThan(from.minusDays(DELTA_DAY), to.plusDays(DELTA_DAY))
        return ExchangeRateIndex(rates, DEFAULT_TARGET_CURRENCY, DELTA_DAY)
    }

    fun rate(date: LocalDate, from: String, to: String): ExchangeRateResult {
        if (from == to) {
            return ExchangeRateResult(BigDecimal.ONE, false)
        }

        val rates = exchangeRateRepository.findByDate(date)

        rates.rate(from, to)?.let {
            return ExchangeRateResult(it, false)
        }

        val leftRate = rates.rate(from, DEFAULT_TARGET_CURRENCY)
        val rightRate = rates.rate(DEFAULT_TARGET_CURRENCY, to)
        if (leftRate != null && rightRate != null) {
            return ExchangeRateResult(leftRate * rightRate, false)
        }

        publisher.publishEvent(ExchangeRateRequestEvent(date, listOf(from, to)))
        return ExchangeRateResult(BigDecimal.ZERO, true)
    }

    fun list(): List<ExchangeRateRecord> = exchangeRateRepository.findAll()
        .map { exchangeRateConverter.toRecord(it) }
        .sortedBy { it.date }

    fun byId(id: String): ExchangeRateRecord = exchangeRateRepository.find(id)
        .let { exchangeRateConverter.toRecord(it) }

    fun update(record: ExchangeRateRecord) {
        if (record.from == record.to) {
            return
        }
        val entity = exchangeRateConverter.toEntity(record)
        exchangeRateRepository.save(entity)
    }

    fun delete(id: String) = exchangeRateRepository.deleteById(id)

    private fun List<ExchangeRate>.rate(from: String, to: String): BigDecimal? = firstOrNull { it.from == from && it.to == to }?.value
            ?: firstOrNull { it.from == to && it.to == from }?.value?.oppositeRate()

    companion object {
        private const val DELTA_DAY = 2L
        const val DEFAULT_TARGET_CURRENCY = "USD"
    }

}
