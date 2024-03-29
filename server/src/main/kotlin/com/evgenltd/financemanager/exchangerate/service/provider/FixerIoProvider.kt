package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.core.annotation.Order
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Profile("prod")
@Order(10)
class FixerIoProvider(
    @Value("\${exchange.apilayer.apikey}")
    private val apiKey: String,
    private val rest: IntegrationRestTemplate
) : ExchangeRateProvider, Loggable() {

    override fun rate(date: LocalDate, from: String, to: String): BigDecimal? {
        val headers = HttpHeaders().also {
            it.set("apikey", apiKey)
        }

        val response = rest.exchange(
            "$URL/$date?base=$from&symbols=$to",
            HttpMethod.GET,
            HttpEntity(null, headers),
            FixerResponse::class.java
        )

        if (!response.statusCode.is2xxSuccessful) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$to, code ${response.statusCode}, body ${response.body}")
            return null
        }

        val body = response.body ?: throw IllegalStateException("Unable to get exchange rate for date=$date, from=$from, to=$to, response body is null")
        if (!body.success) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$to, response body is not success, body=$body")
            return null
        }

        val rates = body.rates
        if (rates == null) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$to, response body rates not found, body=$body")
            return null
        }

        if (rates.isEmpty()) {
            log.error("Unable to get exchange rate for date=$date, from=$from, to=$to, response body rates is empty, body=$body")
            return null
        }

        return rates.values.first()
    }

    private companion object {
        const val URL = "https://api.apilayer.com/fixer"
    }

}

data class FixerResponse(
    val success: Boolean,
    val timestamp: Long? = null,
    val error: FixerError? = null,
    val historical: Boolean? = null,
    val base: String? = null,
    val date: LocalDate? = null,
    val rates: Map<String,BigDecimal>? = null
)

data class FixerError(
    val code: String,
    val type: String,
    val info: String? = null
)