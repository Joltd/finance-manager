package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.AccountGroupConverter
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.accountTypes
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.isNotZero
import com.evgenltd.financemanager.common.service.until
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.report.record.BalanceAccountRecord
import com.evgenltd.financemanager.report.record.BalanceChartRecord
import com.evgenltd.financemanager.report.record.BalanceGroupRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.record.IncomeExpenseGroupRecord
import com.evgenltd.financemanager.report.record.TopFlowGroupRecord
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
class DashboardService(
    private val settingService: SettingService,
    private val accountConverter: AccountConverter,
    private val accountGroupConverter: AccountGroupConverter,
    private val balanceRepository: BalanceRepository,
    private val operationService: OperationService,
    private val exchangeRateService: ExchangeRateService,
    private val reportService: ReportService,
    private val transactionRepository: TransactionRepository,
) {

    fun load(): DashboardRecord {
        val targetCurrency = settingService.load()
            .operationDefaultCurrency
            ?.name
            ?: BASE_CURRENCY

        val (topExpenses, incomeExpense) = flowCharts(targetCurrency)

        return DashboardRecord(
            balance = balanceChart(targetCurrency),
            operations = operationService.listLast(),
            topExpenses = topExpenses,
            incomeExpense = incomeExpense,
        )
    }

    private fun balanceChart(targetCurrency: String): BalanceChartRecord {
        val rateIndex = exchangeRateService.actualRateIndex(targetCurrency)

        val balances = balanceRepository.findAll(Balance::amount.isNotZero())

        val allGroups = balances
            .map { it.account to rateIndex.toTarget(it.amount) }
            .groupingBy {
                (account, _) -> account
            }
            .aggregate { _, accumulator: Amount?, element, _ -> element.second + accumulator }
            .asSequence()
            .map { (account, amount) ->
                BalanceGroupRecord(
                    group = account.group
                        ?.let { accountGroupConverter.toReference(it) }
                        ?: Reference(UUID(0, 0), "No group"),
                    amount = amount,
                    entries = listOf(BalanceAccountRecord(accountConverter.toReference(account), amount))
                )
            }
            .groupingBy { it.group }
            .aggregate { _, accumulator: BalanceGroupRecord?, element, _ ->
                BalanceGroupRecord(
                    group = element.group,
                    amount = element.amount + accumulator?.amount,
                    entries = element.entries + (accumulator?.entries ?: emptyList())
                )
            }
            .values
            .toList()
            .sortedByDescending { it.amount }

        val otherGroup = allGroups.drop(4)
            .map { it.amount }
            .reduceOrNull { acc, amount -> acc + amount }
            ?.let { listOf(BalanceGroupRecord(other = true, amount = it)) }
            ?: emptyList()

        return BalanceChartRecord(
            groups = allGroups.take(4) + otherGroup,
            otherGroups = allGroups.drop(4),
        )
    }

    private fun flowCharts(targetCurrency: String): Pair<List<TopFlowGroupRecord>, List<IncomeExpenseGroupRecord>> {
        val to = LocalDate.now().withDayOfMonth(1).minusMonths(6)
        val from = to.minusMonths(3)

        val transactions = ((Transaction::date between (from until to)) and
                (Transaction::account accountTypes listOf(AccountType.INCOME, AccountType.EXPENSE)))
            .let { transactionRepository.findAll(it) }

        val currencies = transactions.map { it.amount.currency }.distinct()
        val actualRange = Range(
            transactions.minOf { it.date },
            transactions.maxOf { it.date }
        )

        val rateIndex = exchangeRateService.historyRateIndex(targetCurrency, actualRange, currencies)

        val topExpenses = transactions.filter { it.account.type == AccountType.EXPENSE }
            .let { reportService.topFlowData(it, rateIndex, targetCurrency, 3) }

        val incomeExpense = reportService.incomeExpenseData(transactions, rateIndex)

        return topExpenses to incomeExpense
    }

}