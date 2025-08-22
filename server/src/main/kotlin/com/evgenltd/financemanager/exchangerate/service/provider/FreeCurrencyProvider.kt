package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.time.LocalDate

@Service
class FreeCurrencyProvider(
    @Value("\${exchange.free-currency.api-key}")
    private val apiKey: String,
    private val rest: IntegrationRestTemplate
) : ExchangeRateProvider, Loggable() {

    override val name: Provider = Provider.FREE_CURRENCY

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> = request("latest")
        ?.fields()
        ?.asSequence()
        ?.map { ExchangeRateToDefault(it.key, it.value.asText().toBigDecimal()) }
        ?.toList()
        ?: emptyList()

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> =
        request("historical") { it.queryParam("date", date) }
            ?.get(date.toString())
            ?.fields()
            ?.asSequence()
            ?.map { ExchangeRateToDefault(it.key, it.value.asText().toBigDecimal()) }
            ?.toList()
            ?: emptyList()

    private fun request(path: String, block: (UriComponentsBuilder) -> Unit = {}): JsonNode? {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("api.freecurrencyapi.com")
            .pathSegment("v1", path)
            .queryParam("apikey", apiKey)
            .queryParam("base_currency", BASE_CURRENCY)
            .also(block)
            .build()
            .toUri()

        val response = rest.exchange(
            uri,
            HttpMethod.GET,
            null,
            JsonNode::class.java,
        )

        if (!response.statusCode.is2xxSuccessful) {
            return null
        }

        return response.body
            ?.get("data")
    }

}
