package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.AccountGroupConverter
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.AccountBalanceRecord
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.isNotZero
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.record.GroupBalanceRecord
import org.springframework.stereotype.Service
import java.util.*

@Service
class DashboardService(
    private val settingService: SettingService,
    private val accountConverter: AccountConverter,
    private val accountGroupConverter: AccountGroupConverter,
    private val balanceRepository: BalanceRepository,
    private val operationService: OperationService,
    private val exchangeRateService: ExchangeRateService,
) {

    fun load(): DashboardRecord {

        val targetCurrency = settingService.load()
            .operationDefaultCurrency
            ?.name
            ?: BASE_CURRENCY

        val balances = balanceRepository.findAll(Balance::amount.isNotZero())
        
        val accountBalances = balances.groupBy { it.account }
            .map { (account, balances) ->
                AccountBalanceRecord(
                    account = accountConverter.toReference(account),
                    balances = balances.map { it.amount },
                )
            }
            .take(5)

//        val lastDate = accountRepository.findLastReviseDate() ?: transactionRepository.findLastDate() ?: LocalDate.now()
//
//        val to = lastDate.withDayOfMonth(1).plusMonths(1)
//        val from = to.minusMonths(3)
//        val range = from until to
//
//        val transactions = ((Transaction::date between range) and
//                (Transaction::account accountTypes listOf(AccountType.EXPENSE, AccountType.INCOME)))
//            .let { transactionRepository.findAll(it) }

//        val currencies = transactions.map { it.amount.currency }.distinct()
//
//        val rateHistoryIndex = exchangeRateService.historyRateIndex(targetCurrency, range, currencies)
//
//        transactions.filter { it.account.type == AccountType.EXPENSE }
//            .groupBy { it.date.withDayOfMonth(1) }
//            .map { (date, transactions) ->
//                val (e1, e2, e3) = transactions.groupingBy { it.account }
//                    .aggregate { _, accumulator: Amount?, element, _ ->
//                        rateHistoryIndex.toTarget(element.date, element.amount) + accumulator
//                    }
//                    .map { it }
//                    .sortedByDescending { it.value }
//                    .take(3)
//            }

        return DashboardRecord(
            accountBalances = accountBalances,
            operations = operationService.listLast(),
            groupBalances = groupBalances(targetCurrency, balances),
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

    private fun groupBalances(targetCurrency: String, balances: List<Balance>): List<GroupBalanceRecord> {
        val rateIndex = exchangeRateService.actualRateIndex(targetCurrency)

        val groupBalances = balances.map {
            it.account to rateIndex.toTarget(it.amount)
        }.groupingBy {
            (account, _) -> account.group
            ?.let { accountGroupConverter.toReference(it) }
            ?: Reference(UUID.randomUUID(), "No group")
        }
            .aggregate { _, accumulator: Amount?, element, _ -> element.second + accumulator }
            .toList()
            .sortedByDescending { it.second }

        val topGroupBalances = groupBalances.take(4)
            .map { GroupBalanceRecord(it.first, it.second) }

        val otherGroupBalance = groupBalances.drop(4)
            .map { it.second }
            .reduceOrNull { acc, amount -> acc + amount }
            ?.let { listOf(GroupBalanceRecord(null, it)) }
            ?: emptyList()

        return topGroupBalances + otherGroupBalance
    }

}