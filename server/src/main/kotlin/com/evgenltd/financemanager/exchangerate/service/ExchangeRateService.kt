package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.transaction.service.RelationService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.Period
import javax.annotation.PostConstruct
import kotlin.math.absoluteValue

@Service
class ExchangeRateService(
    private val exchangeRateRepository: ExchangeRateRepository,
    private val relationService: RelationService,
    private val exchangeRateProviders: List<ExchangeRateProvider>,
    private val transactionService: TransactionService
) {

    fun list(): List<ExchangeRateRecord> = exchangeRateRepository.findAll().map { it.toRecord() }

    fun byId(id: String): ExchangeRateRecord = exchangeRateRepository.find(id).toRecord()

    fun update(record: ExchangeRateRecord) {
        if (record.from == record.to) {
            return
        }
        val entity = record.toEntity()
        exchangeRateRepository.save(entity)
    }

    fun delete(id: String) = exchangeRateRepository.deleteById(id)

    fun rate(date: LocalDate, from: String, to: String): BigDecimal {
        if (from == to) {
            return BigDecimal.ONE
        }

        loadFromRelations(date, from, to)?.let { return it }

        loadFromDb(date, from, to)?.let { return it }

        loadFromProviders(date, from, to)?.let { return it }

        throw IllegalStateException("Can't find exchange rate for $from/$to on $date")
    }

    private fun loadFromRelations(date: LocalDate, from: String, to: String): BigDecimal? =
        loadByPeriod(date, from, to) { dateFrom, dateTo ->
            val relations = relationService.findRelations(dateFrom, dateTo).filter { it.exchange }
            val transactionIds = relations.flatMap { listOf(it.from, it.to) }.distinct()
            val transactionIndex = transactionService.findTransactions(transactionIds).associateBy { it.id!! }
            relations.map {
                ExchangeRate(
                    id = null,
                    date = it.date,
                    from = transactionIndex[it.from]!!.amount.currency,
                    to = transactionIndex[it.to]!!.amount.currency,
                    value = it.rate()
                )
            }.filter { it.from != it.to }
        }

    private fun loadFromDb(date: LocalDate, from: String, to: String): BigDecimal? =
        loadByPeriod(date, from, to) { dateFrom, dateTo ->
            exchangeRateRepository.findByDateGreaterThanEqualAndDateLessThan(dateFrom, dateTo)
        }

    private fun loadFromProviders(date: LocalDate, from: String, to: String): BigDecimal? {
        for (exchangeRateProvider in exchangeRateProviders) {
            val rate = exchangeRateProvider.rate(date, from, to)
            if (rate != null) {
                exchangeRateRepository.save(ExchangeRate(null, date, from, to, rate))
                return rate
            }
        }
        return null
    }

    private fun loadByPeriod(
        date: LocalDate,
        from: String,
        to: String,
        loader: (dateFrom: LocalDate, dateTo: LocalDate) -> List<ExchangeRate>
    ): BigDecimal? = loader(date.minusDays(RELATIONS_RATE_PERIOD_GAP), date.plusDays(RELATIONS_RATE_PERIOD_GAP))
        .filter { (it.from == from && it.to == to) || (it.from == to && it.to == from) }
        .minByOrNull { Period.between(date, it.date).days.absoluteValue }
        ?.let {
            if (it.from == from && it.to == to) {
                it.value
            } else {
                BigDecimal.ONE.divide(it.value, 10, RoundingMode.HALF_UP)
            }
        }

    private fun ExchangeRate.toRecord(): ExchangeRateRecord = ExchangeRateRecord(
            id = id,
            date = date,
            from = from,
            to = to,
            value = value
    )

    private fun ExchangeRateRecord.toEntity(): ExchangeRate = ExchangeRate(
            id = id,
            date = date,
            from = from,
            to = to,
            value = value
    )

    private companion object {
        const val RELATIONS_RATE_PERIOD_GAP = 3L
    }

}