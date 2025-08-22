package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
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
class OpenExchangeDataProvider(
    @Value("\${exchange.open-exchange.app-id}")
    private val appId: String,
    private val rest: IntegrationRestTemplate
) : ExchangeRateProvider {

    override val name: Provider = Provider.OPEN_EXCHANGE

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> = request("latest.json")

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> = request("historical", "$date.json")

    private fun request(vararg path: String): List<ExchangeRateToDefault> {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("openexchangerates.org")
            .pathSegment("api", *path)
            .queryParam("app_id", appId)
            .queryParam("base", BASE_CURRENCY)
            .build()
            .toUri()

        val response = rest.exchange(
            uri,
            HttpMethod.GET,
            null,
            JsonNode::class.java
        )

        if (!response.statusCode.is2xxSuccessful) {
            return emptyList()
        }

        return response.body
            ?.get("rates")
            ?.fields()
            ?.asSequence()
            ?.map { ExchangeRateToDefault(it.key, it.value.asText().toBigDecimal()) }
            ?.toList()
            ?: emptyList()
    }

}