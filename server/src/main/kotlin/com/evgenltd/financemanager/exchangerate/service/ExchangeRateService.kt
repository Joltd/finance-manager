package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.converter.ExchangeRateConverter
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.exchangerate.service.provider.StubProvider
import com.evgenltd.financemanager.importexport.service.parser.dateTime
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate

@Service
class ExchangeRateService(
    private val exchangeRateRepository: ExchangeRateRepository,
    private val exchangeRateConverter: ExchangeRateConverter,
    private val exchangeRateProviders: List<ExchangeRateProvider>
) : Loggable() {

    @PostConstruct
    fun postConstruct() {
        if (exchangeRateRepository.count() > 0) {
            return
        }

        val mapper = ObjectMapper()
        val ratesFile = {}.javaClass.getResource("/rates.json")
        val currencies = listOf("USD","EUR","RUB","KZT","TRY","RSD","GEL")
        mapper.readTree(ratesFile)
            .onEach {
                val date = it.get("date").get("\$date").asText().dateTime("yyyy-MM-dd'T'HH:mm:ss'Z'")
                val from = it.get("from").asText()
                val to = it.get("to").asText()
                val value = it.get("value").asText().toBigDecimal()
                if (from in currencies && to in currencies) {
                    val rate = ExchangeRate(null, date, from, to, value)
                    exchangeRateRepository.save(rate)
                }
            }
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

    fun actualRate(fromCurrency: String, toCurrency: String): BigDecimal =
        rate(LocalDate.now().minusDays(1), fromCurrency, toCurrency)

    fun rateStartOfWeek(date: LocalDate, fromCurrency: String, toCurrency: String): BigDecimal =
        rate(date.with(DayOfWeek.MONDAY), fromCurrency, toCurrency)

    fun rate(date: LocalDate, fromCurrency: String, toCurrency: String): BigDecimal {

        val from = mapCurrency(fromCurrency) ?: return BigDecimal.ZERO
        val to = mapCurrency(toCurrency) ?: return BigDecimal.ZERO

        if (from == to) {
            return BigDecimal.ONE
        }

        val rates = exchangeRateRepository.findByDate(date)
        val directRate = rates.rate(from, to)
        if (directRate != null) {
            return directRate
        }

        val reverseRate = rates.rate(to, from)?.let { BigDecimal.ONE.divide(it, 4, RoundingMode.HALF_UP) }
        if (reverseRate != null) {
            return reverseRate
        }

        val fromRate = rates.rate(from, "USD")
        val toRate = rates.rate("USD", to)
        if (fromRate != null && toRate != null) {
            return fromRate * toRate
        }

        for (exchangeRateProvider in exchangeRateProviders) {
            val providerRate = exchangeRateProvider.rate(date, from, to) ?: continue
            log.info("Exchange rate for $from/$to on $date is $providerRate by ${exchangeRateProvider::class.simpleName}")

            if (exchangeRateProvider !is StubProvider) {
                exchangeRateRepository.save(ExchangeRate(null, date, from, to, providerRate))
            }

            return providerRate
        }

        throw IllegalStateException("Can't find exchange rate for $from/$to on $date")
    }

    private fun List<ExchangeRate>.rate(from: String, to: String): BigDecimal? = firstOrNull { it.from == from && it.to == to }?.value

    private fun mapCurrency(currency: String): String? = when (currency) {
        "USDT" -> "USD"
        "TRX" -> null
        else -> currency
    }

}
