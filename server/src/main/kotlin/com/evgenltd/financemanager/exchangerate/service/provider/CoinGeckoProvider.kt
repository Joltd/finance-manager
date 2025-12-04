package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.evgenltd.financemanager.common.util.oppositeRate
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateToDefault
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class CoinGeckoProvider(
    @Value("\${exchange.coin-gecko.api-key}")
    private val apiKey: String,
    private val rest: IntegrationRestTemplate
) : ExchangeRateProvider {

    override val name: ExchangeRateProviders = ExchangeRateProviders.COIN_GECKO

    override fun latest(currencyHints: List<String>): List<ExchangeRateToDefault> =
        currencyHints.mapNotNull { coin ->
            request("coins", coin.geckoCoinId())
                ?.let { ExchangeRateToDefault(coin, it) }
        }

    override fun historical(date: LocalDate, currencyHints: List<String>): List<ExchangeRateToDefault> =
        currencyHints.mapNotNull { coin ->
            request("coins", coin.geckoCoinId(), "history") { it.queryParam("date", date.format(DATE_FORMATTER)) }
                ?.let { ExchangeRateToDefault(coin, it) }
        }

    private fun request(vararg path: String, block: (UriComponentsBuilder) -> Unit = {}): BigDecimal? {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("api.coingecko.com")
            .pathSegment("api", "v3", *path)
            .queryParam("localization", "false")
            .queryParam("community_data", "false")
            .queryParam("developer_data", "false")
            .queryParam("sparkline", "false")
            .queryParam("vs_currency", BASE_CURRENCY)
            .apply(block)
            .build()
            .toUri()

        val headers = HttpHeaders()
        headers.set("x-cg-demo-api-key", apiKey)

        val response = rest.exchange(
            uri,
            HttpMethod.GET,
            HttpEntity<Void>(headers),
            JsonNode::class.java,
        )

        if (!response.statusCode.is2xxSuccessful) {
            return null
        }

        return response.body
            ?.get("market_data")
            ?.get("current_price")
            ?.get(BASE_CURRENCY.lowercase())
            ?.asText()
            ?.toBigDecimal()
            ?.oppositeRate()
    }

    private fun String.geckoCoinId(): String = when (this.lowercase()) {
        "usdt" -> "tether"
        "trx" -> "tron"
        "eth" -> "ethereum"
        else -> this
    }

    private companion object {
        val DATE_FORMATTER: DateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy")
    }

}