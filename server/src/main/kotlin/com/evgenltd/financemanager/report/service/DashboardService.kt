package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val transactionService: TransactionService,
    private val settingService: SettingService
) {

    fun load(): DashboardRecord {

        val cashFunds = transactionService.findCashTransactions()
            .groupingBy { it.amount.currency }
            .aggregate { currency, accumulator: Amount?, transaction, _ ->
                (accumulator ?: Amount(0, currency)) + transaction.signedAmount()
            }
            .toMutableMap()

        val defaultCurrency = settingService.operationDefaultCurrency() ?: MAIN_CURRENCY
        val defaultCurrencyAmount = cashFunds.remove(defaultCurrency) ?: emptyAmount(defaultCurrency)
        val usdCashAmount = cashFunds.remove(MAIN_CURRENCY) ?: emptyAmount(MAIN_CURRENCY)

        return DashboardRecord(
            defaultCurrencyAmount = defaultCurrencyAmount,
            usdCashAmount = usdCashAmount.takeIf { defaultCurrencyAmount.currency != MAIN_CURRENCY },
            cashFounds = cashFunds.values
                .filter { it.isNotEmpty() }
                .toList()
                .sortedBy { it.currency }
        )
    }

    private companion object {
        const val MAIN_CURRENCY = "USD"
    }

}