package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Order(10)
class ExchangeRatesDataProvider(
    @Value("\${exchange.exchange_rates.apikey}")
    private val apiKey: String,
    exchangeRateRepository: ExchangeRateRepository
) : LimitedExchangeRateProvider(exchangeRateRepository) {

    private val rest = RestTemplate()

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>): Map<String, BigDecimal> {
        val headers = HttpHeaders().also {
            it.set("apikey", apiKey)
        }

        val response = rest.exchange(
            "$URL/$date?base=$from&symbols=$toCurrencies",
            HttpMethod.GET,
            HttpEntity(null, headers),
            ExchangeRatesResponse::class.java
        )

        if (!response.statusCode.is2xxSuccessful) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies, code ${response.statusCode}, body ${response.body}")
            return emptyMap()
        }

        val body = response.body ?: throw IllegalStateException("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies, response body is null")
        if (!body.success) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies, response body is not success, body=$body")
            return emptyMap()
        }

        val rates = body.rates
        if (rates == null) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies, response body rates not found, body=$body")
            return emptyMap()
        }
        return rates
    }

    private companion object {
        const val URL = "https://api.apilayer.com/exchangerates_data"
    }

}

data class ExchangeRatesResponse(
    val success: Boolean,
    val timestamp: Long? = null,
    val error: ExchangeRatesError? = null,
    val historical: Boolean? = null,
    val base: String? = null,
    val date: LocalDate? = null,
    val rates: Map<String, BigDecimal>? = null
)

data class ExchangeRatesError(
    val code: Int,
    val message: String
)