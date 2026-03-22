package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestClient
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import tools.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.time.LocalDate

@SkipLogging
@Service
class ExchangeRateDataProvider(
    @Value("\${exchange.exchange-rate.api-key}")
    private val apiKey: String,
    private val rest: IntegrationRestClient
) : ExchangeRateProvider, Loggable() {

    @SkipLogging
    override val name: ExchangeRateProviders = ExchangeRateProviders.EXCHANGE_RATE

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> = request("latest", BASE_CURRENCY)

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> =
        request("history", BASE_CURRENCY, date.year.toString(), date.monthValue.toString(), date.dayOfMonth.toString())

    private fun request(vararg path: String): List<ExchangeRateToDefault> {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("v6.exchangerate-api.com")
            .pathSegment("v6", apiKey, *path)
            .build()
            .toUri()

        val response = rest.get()
            .uri(uri)
            .retrieve()
            .toEntity(JsonNode::class.java)

        if (!response.statusCode.is2xxSuccessful) {
            return emptyList()
        }

        return response.body
            ?.get("conversion_rates")
            ?.properties()
            ?.asSequence()
            ?.map { ExchangeRateToDefault(it.key, it.value.asText().toBigDecimal()) }
            ?.toList()
            ?: emptyList()
    }

}