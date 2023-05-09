package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Order(10)
class CurrencyDataProvider(
    @Value("\${exchange.apilayer.apikey}")
    private val apiKey: String,
    exchangeRateRepository: ExchangeRateRepository,
    private val rest: IntegrationRestTemplate
) : LimitedExchangeRateProvider(exchangeRateRepository) {

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>): Map<String, BigDecimal> {
        val headers = HttpHeaders().also {
            it.set("apikey", apiKey)
        }

        val response = rest.exchange(
            "${URL}/historical?date=$date&source=$from&currencies=${toCurrencies.joinToString(",")}",
            HttpMethod.GET,
            HttpEntity(null, headers),
            CurrencyDataResponse::class.java
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

        val rates = body.quotes
        if (rates == null) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$toCurrencies, response body rates not found, body=$body")
            return emptyMap()
        }

        return rates.entries
            .associate { it.key.replace(from, "") to it.value }
    }

    private companion object {
        const val URL = "https://api.apilayer.com/currency_data"
    }

}

data class CurrencyDataResponse(
    val success: Boolean,
    val error: CurrencyDataError? = null,
    val timestamp: Long? = null,
    val historical: Boolean? = null,
    val source: String? = null,
    val date: LocalDate? = null,
    val quotes: Map<String,BigDecimal>? = null
)

data class CurrencyDataError(
    val code: String,
    val info: String
)