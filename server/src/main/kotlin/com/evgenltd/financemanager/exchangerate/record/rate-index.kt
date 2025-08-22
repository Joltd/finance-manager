package com.evgenltd.financemanager.exchangerate.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.oppositeRate
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import java.math.BigDecimal
import java.time.LocalDate

class ExchangeRateIndex(private val targetCurrency: String, private val rates: Map<String, BigDecimal>) {

    fun toTarget(amount: Amount): Amount {
        if (amount.currency == targetCurrency) {
            return amount
        }

        if (amount.currency == BASE_CURRENCY) {
            return rates[targetCurrency]
                ?.let { amount.convert(it, targetCurrency) }
                ?: Amount(0, targetCurrency)
        }

        if (targetCurrency == BASE_CURRENCY) {
            return rates[amount.currency]
                ?.let { amount.convert(it.oppositeRate(), targetCurrency) }
                ?: Amount(0, targetCurrency)
        }

        val sourceToBaseRate = rates[amount.currency] ?: return Amount(0, targetCurrency)
        val baseToTargetRate = rates[targetCurrency] ?: return Amount(0, targetCurrency)

        return amount.convert(sourceToBaseRate.oppositeRate(), BASE_CURRENCY)
            .convert(baseToTargetRate, targetCurrency)
    }

}

class ExchangeRateHistoryIndex(private val targetCurrency: String, rates: Map<LocalDate, Map<String, BigDecimal>>) {

    private val index = rates.mapValues { (_, rates) -> ExchangeRateIndex(targetCurrency, rates) }

    fun toTarget(date: LocalDate, amount: Amount): Amount = index[date]
        ?.toTarget(amount)
        ?: Amount(0, targetCurrency)

}