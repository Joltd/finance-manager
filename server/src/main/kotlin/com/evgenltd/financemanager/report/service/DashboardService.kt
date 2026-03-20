package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.AccountGroupConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.accountTypes
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.service.withMonday
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.report.record.DashboardGroupBalanceRecord
import com.evgenltd.financemanager.report.record.DashboardMonthlyAvgRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.record.DashboardTopExpenseRecord
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class DashboardService(
    private val settingService: SettingService,
    private val accountConverter: AccountConverter,
    private val accountGroupConverter: AccountGroupConverter,
    private val balanceRepository: BalanceRepository,
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val exchangeRateService: ExchangeRateService,
    private val transactionRepository: TransactionRepository,
) {

    fun load(): DashboardRecord {
        val targetCurrency = settingService.load()
            .operationDefaultCurrency
            ?.name
            ?: BASE_CURRENCY

        val empty = emptyAmount(targetCurrency)

        val actualRateIndex = exchangeRateService.actualRateIndex(targetCurrency)

        val groupBalances = balanceRepository.findAll()
            .filter { it.account.type == AccountType.ACCOUNT && !it.account.deleted }
            .groupBy { it.account.group }
            .map { (group, entries) ->
                val balance = entries
                    .map { actualRateIndex.toTarget(it.amount) }
                    .reduce { a, b -> a + b }
                DashboardGroupBalanceRecord(
                    group = group?.let { accountGroupConverter.toReference(it) },
                    balance = balance,
                )
            }
            .sortedByDescending { it.balance.value }

        val totalBalance = groupBalances
            .map { it.balance }
            .reduceOrNull { a, b -> a + b }
            ?: empty

        val recentOperations = operationRepository
            .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date")))
            .content
            .map { operationConverter.toRecord(it) }

        val today = LocalDate.now()
        val from = today.withDayOfMonth(1).minusMonths(5)
        val to = today.withDayOfMonth(1).plusMonths(1)

        val transactions = ((Transaction::date between Range(from, to)) and
                (Transaction::account accountTypes listOf(AccountType.INCOME, AccountType.EXPENSE)))
            .let { transactionRepository.findAll(it) }

        if (transactions.isEmpty()) {
            return DashboardRecord(
                totalBalance = totalBalance,
                groupBalances = groupBalances,
                avgMonthly = DashboardMonthlyAvgRecord(income = empty, expense = empty, net = empty),
                topExpenses = emptyList(),
                recentOperations = emptyList(),
            )
        }

        val currencies = transactions.map { it.amount.currency }.distinct()
        val actualRange = Range(
            transactions.minOf { it.date },
            transactions.maxOf { it.date },
        )

        val rateIndex = exchangeRateService.historyRateIndex(targetCurrency, actualRange, currencies)
        val numMonths = ChronoUnit.MONTHS.between(from, to).coerceAtLeast(1).toBigDecimal()

        val entries = transactions.map {
            Entry(
                account = it.account,
                month = it.date.withDayOfMonth(1),
                amount = rateIndex.toTarget(it.date.withMonday(), it.amount),
            )
        }

        val topExpenses = entries
            .filter { it.account.type == AccountType.EXPENSE }
            .groupingBy { EntryKey(it.account, it.month) }
            .aggregate { _, acc: Entry?, element, _ ->
                Entry(
                    account = acc?.account ?: element.account,
                    month = acc?.month ?: element.month,
                    amount = element.amount + acc?.amount,
                )
            }
            .values
            .groupBy { it.account }
            .map { (account, monthEntries) ->
                val total = monthEntries.map { it.amount }.reduce { a, b -> a + b }
                DashboardTopExpenseRecord(
                    expense = accountConverter.toReference(account),
                    avg = total / numMonths,
                )
            }
            .sortedByDescending { it.avg.value }
            .take(5)

        val totalByType = entries
            .groupBy { it.account.type }
            .mapValues { (_, typeEntries) ->
                typeEntries.map { it.amount }.reduce { a, b -> a + b }
            }

        val incomeTotal = totalByType[AccountType.INCOME] ?: empty
        val expenseTotal = totalByType[AccountType.EXPENSE] ?: empty
        val avgMonthly = DashboardMonthlyAvgRecord(
            income = incomeTotal / numMonths,
            expense = expenseTotal / numMonths,
            net = (incomeTotal - expenseTotal) / numMonths,
        )

        return DashboardRecord(
            totalBalance = totalBalance,
            groupBalances = groupBalances,
            avgMonthly = avgMonthly,
            topExpenses = topExpenses,
            recentOperations = recentOperations,
        )
    }

    private data class EntryKey(val account: Account, val month: LocalDate)

    private data class Entry(val account: Account, val month: LocalDate, val amount: Amount)

}