package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
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
    private val exchangeRateProviders: List<ExchangeRateProvider>
) {

    @PostConstruct
    fun postConstruct() {
        if (exchangeRateRepository.findAll().isNotEmpty()) {
            return
        }
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-24"),"USD","RUB",BigDecimal("81.495038")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-24"),"USD","KZT",BigDecimal("455.354961")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-24"),"RUB","KZT",BigDecimal("5.587518")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-24"),"RUB","GEL",BigDecimal("0.030684")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-10-15"),"EUR","RUB",BigDecimal("60.917252")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-09"),"RSD","RUB",BigDecimal("0.569862")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-09"),"USD","RUB",BigDecimal("63.40369")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-10"),"GEL","RUB",BigDecimal("23.498442")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-15"),"GEL","RUB",BigDecimal("24.268987")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-22"),"GEL","RUB",BigDecimal("25.564087")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-31"),"GEL","RUB",BigDecimal("27.275923")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-01-03"),"USD","RUB",BigDecimal("73.050191")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-01-05"),"GEL","RUB",BigDecimal("26.701464")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-01-12"),"GEL","RUB",BigDecimal("25.29835")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-01-09"),"GEL","RUB",BigDecimal("26.039099")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-12-29"),"USD","RUB",BigDecimal("74.000268")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-02-04"),"GEL","RUB",BigDecimal("26.859268")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-01-30"),"USD","RUB",BigDecimal("69.914975")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-02-09"),"GEL","RUB",BigDecimal("27.358264")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-02-20"),"USD","RUB",BigDecimal("75.498974")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-02-25"),"GEL","RUB",BigDecimal("28.847772")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-02-28"),"USD","RUB",BigDecimal("75.050387")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-03-11"),"GEL","RUB",BigDecimal("29.53184")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-03-23"),"GEL","RUB",BigDecimal("29.515138")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-09"),"GEL","RUB",BigDecimal("32.114009")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-11"),"USD","RUB",BigDecimal("81.091494")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2023-04-14"),"GEL","RUB",BigDecimal("32.48513")))
        exchangeRateRepository.save(ExchangeRate(null, LocalDate.parse("2022-04-05"),"USD","RUB",BigDecimal("83.999854")))
    }

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

    fun rate(date: LocalDate, from: String, toCurrencies: List<String>): Map<String,BigDecimal> {
        if (toCurrencies.isEmpty()) {
            return emptyMap()
        }

        val toCurrenciesSet = toCurrencies.toMutableSet()
        val result = mutableMapOf<String,BigDecimal>()
        for (exchangeRateProvider in exchangeRateProviders) {
            if (toCurrenciesSet.isEmpty()) {
                break
            }
            exchangeRateProvider.rate(date, from, toCurrenciesSet, ExchangeRateProvider.SHORT_PERIOD_GAP)
                .onEach {
                    result[it.key] = it.value
                    toCurrenciesSet.remove(it.key)
                }
        }
        return result
    }

    fun rate(date: LocalDate, from: String, to: String): BigDecimal {
        if (from == to) {
            return BigDecimal.ONE
        }

        val result = rate(date, from, listOf(to))
        return result[to] ?: throw IllegalStateException("Can't find exchange rate for $from/$to on $date")
    }

    fun rate(from: List<String>, to: String): Map<String, BigDecimal> {
        if (from.isEmpty()) {
            return emptyMap()
        }

        return rate(LocalDate.now().minusDays(1), to, from)
            .entries
            .associate {
                it.key to BigDecimal.ONE.divide(it.value, 10, RoundingMode.HALF_UP)
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

}