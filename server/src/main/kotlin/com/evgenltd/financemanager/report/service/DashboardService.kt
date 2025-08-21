package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.service.BalanceService
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.report.record.DashboardRecordOld
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.account.service.TurnoverService
import com.evgenltd.financemanager.account.service.sliceLast
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.isNotZero
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.report.record.AccountBalanceRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val settingService: SettingService,
    private val accountConverter: AccountConverter,
    private val turnoverService: TurnoverService,
    private val balanceRepository: BalanceRepository,
    private val balanceService: BalanceService,
    private val operationRepository: OperationRepository,
    private val operationService: OperationService,
    private val exchangeRateService: ExchangeRateService,
) {

    fun load(): DashboardRecord {

        val defaultCurrency = settingService.operationDefaultCurrency() ?: MAIN_CURRENCY

        val accountBalances = balanceService.listCommon()
            .groupBy { it.account }
            .map { (account, balances) ->
                AccountBalanceRecord(
                    account = account,
                    amounts = balances.map { it.amount },
                )
            }

        return DashboardRecord(
            accountBalances = accountBalances,
            operations = operationService.listLast(),
            groupBalances = emptyList(),
            topExpenses = emptyList(),
            incomeExpense = emptyList(),
        )

//        val cashFunds = settingService.operationCashAccount()
//            ?.let { turnoverService.listByAccount(it) }
//            ?.sliceLast()
//            ?.map { it.key.currency to it.value.cumulativeAmount }
//            ?.associate { it }
//            ?.toMutableMap()
//            ?: mutableMapOf()
//
//         ?: MAIN_CURRENCY
//        val defaultCurrencyAmount = cashFunds.remove(defaultCurrency) ?: emptyAmount(defaultCurrency)
//        val usdCashAmount = cashFunds.remove(MAIN_CURRENCY) ?: emptyAmount(MAIN_CURRENCY)
//
//        return DashboardRecordOld(
//            defaultCurrencyAmount = defaultCurrencyAmount,
//            usdCashAmount = usdCashAmount.takeIf { defaultCurrencyAmount.currency != MAIN_CURRENCY },
//            cashFounds = cashFunds.values
//                .filter { it.isNotZero() }
//                .toList()
//                .sortedBy { it.currency }
//        )
    }

    private companion object {
        const val MAIN_CURRENCY = "USD"
    }

}