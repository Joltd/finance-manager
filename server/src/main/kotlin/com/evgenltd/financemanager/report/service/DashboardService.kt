package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.record.FundRecord
import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.record.GraphStateRecord
import com.evgenltd.financemanager.transaction.service.GraphStateService
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class DashboardService(
    private val graphStateService: GraphStateService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(): DashboardRecord {

        val graph = graphStateService.find()
        val amounts = graph.fund
            .map { it.value.sum(Fund.currency(it.key)) }
            .groupBy { it.currency }
            .map { it.value.reduce { acc, amount -> acc + amount } }

        val fromCurrencies = amounts.map { it.currency }.filter { it !in listOf("USDT", "TRX") }
        val mainCurrencyRates = exchangeRateService.rate(fromCurrencies, MAIN_CURRENCY)
        val secondaryCurrencyRates = exchangeRateService.rate(fromCurrencies, SECONDARY_CURRENCY)

        val amountsInMainCurrency = amounts.convertToCurrency(mainCurrencyRates)
        val amountsInSecondaryCurrency = amounts.convertToCurrency(secondaryCurrencyRates)

        val totalInMainCurrency = amountsInMainCurrency.values.fold(BigDecimal.ZERO) { acc, amount -> acc + amount }
        val totalInSecondaryCurrency = amountsInSecondaryCurrency.values.fold(BigDecimal.ZERO) { acc, amount -> acc + amount }

        return DashboardRecord(
            graph = GraphStateRecord(
                status = graph.status,
                date = graph.date,
                error = graph.error
            ),
            funds = amounts.map {
                val amountInMainCurrency = amountsInMainCurrency[it.currency] ?: BigDecimal.ZERO
                FundRecord(
                    amount = it,
                    weight = (amountInMainCurrency / totalInMainCurrency * BigDecimal(100)).toInt()
                )
            },
            fundsTotal = Amount(totalInMainCurrency.toAmountValue(), MAIN_CURRENCY),
            fundsTotalSecondary = Amount(totalInSecondaryCurrency.toAmountValue(), SECONDARY_CURRENCY)
        )

    }

    private fun List<Amount>.convertToCurrency(rates: Map<String,BigDecimal>): Map<String,BigDecimal> = associate {
        val currency = if (it.currency == "USDT") "USD" else it.currency
        if (it.currency == "TRX") {
            it.currency to BigDecimal.ZERO
        } else {
            it.currency to it.toBigDecimal() * rates[currency]!!
        }
    }

    private companion object {
        const val MAIN_CURRENCY = "USD"
        const val SECONDARY_CURRENCY = "RUB"
    }

}