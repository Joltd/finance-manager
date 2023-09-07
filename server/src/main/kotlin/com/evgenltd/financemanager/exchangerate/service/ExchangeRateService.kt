package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.exchangerate.converter.ExchangeRateConverter
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate

@Service
class ExchangeRateService(
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateConverter: ExchangeRateConverter,
    private val exchangeRateProviders: List<ExchangeRateProvider>
) {

//    @PostConstruct
//    fun postConstruct() {
//        if (exchangeRateRepository.findAll().isNotEmpty()) {
//            return
//        }
//
//        val mapper = jacksonObjectMapper()
//        mapper.registerModule(JavaTimeModule())
//        val ratesFile = {}.javaClass.getResource("/rates.json")
//        val rates = mapper.readValue<List<ExchangeRateRecord>>(ratesFile)
//        for (rate in rates) {
//            update(rate)
//        }
//    }

    fun list(): List<ExchangeRateRecord> = exchangeRateRepository.findAll()
        .map { exchangeRateConverter.toRecord(it) }

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

    fun rate(date: LocalDate, from: String, toCurrencies: List<String>): Map<String,BigDecimal> {
        val toCurrenciesSet = toCurrencies.toMutableSet()
        val result = mutableMapOf<String,BigDecimal>()
        for (exchangeRateProvider in exchangeRateProviders) {
            if (toCurrenciesSet.isEmpty()) {
                break
            }
            exchangeRateProvider.rate(date, from, toCurrenciesSet, ExchangeRateProvider.LONG_PERIOD_GAP)
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

        val pair = listOf(from, to)
        if ("USDT" in pair && "USD" in pair) {
            return BigDecimal.ONE
        }

        if ("USD" !in pair) {
            return rate(date, from, "USD") * rate(date, "USD", to)
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

}