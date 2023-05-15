package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Order(5)
class ExchangeRatesDataProvider(
    exchangeRateRepository: ExchangeRateRepository,
    private val rest: IntegrationRestTemplate
) : LimitedExchangeRateProvider(exchangeRateRepository) {

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>): Map<String, BigDecimal> {
        val response = rest.getForEntity(
            "$URL/$date?base=$from&symbols=${toCurrencies.joinToString(",")}",
            ExchangeRateDataResponse::class.java
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
        const val URL = "https://api.exchangerate.host"
    }

}

data class ExchangeRateDataResponse(
    val success: Boolean,
    val error: ExchangeRateDataError? = null,
    val historical: Boolean? = null,
    val base: String? = null,
    val date: LocalDate? = null,
    val rates: Map<String, BigDecimal>? = null
)

data class ExchangeRateDataError(
    val code: String,
    val message: String
)