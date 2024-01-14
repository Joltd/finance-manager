package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.turnover.service.TurnoverService
import com.evgenltd.financemanager.turnover.service.sliceLast
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val settingService: SettingService,
    private val turnoverService: TurnoverService,
) {

    fun load(): DashboardRecord {
        val cashFunds = settingService.operationCashAccount()
            ?.let { turnoverService.listByAccount(it) }
            ?.sliceLast()
            ?.map { it.key.currency to it.value.cumulativeAmount }
            ?.associate { it }
            ?.toMutableMap()
            ?: mutableMapOf()

        val defaultCurrency = settingService.operationDefaultCurrency() ?: MAIN_CURRENCY
        val defaultCurrencyAmount = cashFunds.remove(defaultCurrency) ?: emptyAmount(defaultCurrency)
        val usdCashAmount = cashFunds.remove(MAIN_CURRENCY) ?: emptyAmount(MAIN_CURRENCY)

        return DashboardRecord(
            defaultCurrencyAmount = defaultCurrencyAmount,
            usdCashAmount = usdCashAmount.takeIf { defaultCurrencyAmount.currency != MAIN_CURRENCY },
            cashFounds = cashFunds.values
                .filter { it.isNotZero() }
                .toList()
                .sortedBy { it.currency }
        )
    }

    private companion object {
        const val MAIN_CURRENCY = "USD"
    }

}