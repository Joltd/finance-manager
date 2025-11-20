package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.accountTypes
import com.evgenltd.financemanager.common.repository.accounts
import com.evgenltd.financemanager.common.repository.accountsNot
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.currency
import com.evgenltd.financemanager.common.service.validHalfYear
import com.evgenltd.financemanager.common.service.withMonday
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.isNotZero
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateHistoryIndex
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.report.record.IncomeExpenseEntryRecord
import com.evgenltd.financemanager.report.record.IncomeExpenseFilter
import com.evgenltd.financemanager.report.record.IncomeExpenseGroupRecord
import com.evgenltd.financemanager.report.record.IncomeExpenseReportRecord
import com.evgenltd.financemanager.report.record.TopFlowEntryRecord
import com.evgenltd.financemanager.report.record.TopFlowGroupRecord
import com.evgenltd.financemanager.report.record.TopFlowFilter
import com.evgenltd.financemanager.report.record.TopFlowReportRecord
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.stereotype.Service
import java.time.LocalDate
import kotlin.collections.component1
import kotlin.collections.component2

@Service
class ReportService(
    private val transactionRepository: TransactionRepository,
    private val settingService: SettingService,
    private val exchangeRateService: ExchangeRateService,
    private val accountConverter: AccountConverter,
) {

    fun topFlowReport(filter: TopFlowFilter): TopFlowReportRecord {

        if (filter.type == AccountType.ACCOUNT) {
            throw IllegalArgumentException("Account type doesn't supported")
        }

        val targetCurrency = settingService.load()
            .operationDefaultCurrency
            ?.name
            ?: BASE_CURRENCY

        val transactions = ((Transaction::date between filter.date.validHalfYear()) and
                (Transaction::account accountTypes filter.type?.let { listOf(it) }) and
                (Transaction::account accountsNot filter.exclude) and
                (Transaction::account accounts filter.include))
            .let { transactionRepository.findAll(it) }

        if (transactions.isEmpty()) {
            return TopFlowReportRecord()
        }

        val currencies = transactions.map { it.amount.currency }.distinct()
        val actualRange = Range(
            transactions.minOf { it.date },
            transactions.maxOf { it.date }
        )

        val rateIndex = exchangeRateService.historyRateIndex(targetCurrency, actualRange, currencies)

        val result = topFlowData(transactions, rateIndex, targetCurrency)
        return TopFlowReportRecord(result)
    }

    fun topFlowData(transactions: List<Transaction>, rateIndex: ExchangeRateHistoryIndex, targetCurrency: String, groupLimit: Int = 5): List<TopFlowGroupRecord> =
        transactions
            .asSequence()
            .filter { it.account.type == AccountType.EXPENSE }
            .map {
                TopFlowAggregation(
                    date = it.date.withDayOfMonth(1),
                    account = it.account,
                    amount = rateIndex.toTarget(it.date.withMonday(), it.amount)
                )
            }
            .groupingBy { TopFlowKey(it.date, it.account) }
            .aggregate { _, accumulator: TopFlowAggregation?, element, _ ->
                TopFlowAggregation(
                    date = accumulator?.date ?: element.date,
                    account = accumulator?.account ?: element.account,
                    amount = element.amount + accumulator?.amount,
                )
            }
            .asSequence()
            .filter { (_, value) -> value.amount.isNotZero() }
            .groupBy { (key, _) -> key.date }
            .map { (date , entries) ->
                val allEntries = entries.map { (_, value) ->
                    TopFlowEntryRecord(
                        account = accountConverter.toReference(value.account),
                        amount = value.amount,
                    )
                }.sortedByDescending { it.amount }

                val otherEntries = allEntries.drop(groupLimit)
                    .map { it.amount }
                    .reduceOrNull { acc, amount -> acc + amount }
                    ?.let { listOf(TopFlowEntryRecord(other = true, amount = it)) }
                    ?: emptyList()

                TopFlowGroupRecord(
                    date = date,
                    amount = allEntries.map { it.amount }
                        .reduceOrNull { acc, amount -> acc + amount }
                        ?: emptyAmount(targetCurrency),
                    entries = allEntries.take(groupLimit) + otherEntries,
                    otherEntries = allEntries.drop(groupLimit),
                )
            }
            .sortedBy { it.date }

    fun incomeExpenseReport(filter: IncomeExpenseFilter): IncomeExpenseReportRecord {
        val targetCurrency = settingService.load()
            .operationDefaultCurrency
            ?.name
            ?: BASE_CURRENCY

        val transactions = ((Transaction::date between filter.date.validHalfYear()) and
                (Transaction::account accountTypes listOf(AccountType.INCOME, AccountType.EXPENSE)))
            .let { transactionRepository.findAll(it) }

        if (transactions.isEmpty()) {
            return IncomeExpenseReportRecord()
        }

        val currencies = transactions.map { it.amount.currency }.distinct()
        val actualRange = Range(
            transactions.minOf { it.date },
            transactions.maxOf { it.date }
        )

        val rateIndex = exchangeRateService.historyRateIndex(targetCurrency, actualRange, currencies)

        val result = incomeExpenseData(transactions, rateIndex)
        return IncomeExpenseReportRecord(result)
    }

    fun incomeExpenseData(transactions: List<Transaction>, rateIndex: ExchangeRateHistoryIndex): List<IncomeExpenseGroupRecord> =
        transactions
            .asSequence()
            .filter { it.account.type in listOf(AccountType.INCOME, AccountType.EXPENSE) }
            .map {
                IncomeExpenseAggregation(
                    date = it.date.withDayOfMonth(1),
                    type = it.account.type,
                    amount = rateIndex.toTarget(it.date.withMonday(), it.amount)
                )
            }
            .groupingBy { IncomeExpenseKey(it.date, it.type) }
            .aggregate { _, accumulator: IncomeExpenseAggregation?, element, _ ->
                IncomeExpenseAggregation(
                    date = accumulator?.date ?: element.date,
                    type = accumulator?.type ?: element.type,
                    amount = element.amount + accumulator?.amount,
                )
            }
            .asSequence()
            .filter { (_, value) -> value.amount.isNotZero() }
            .groupBy { (key, _) -> key.date }
            .map { (date, entries) ->
                IncomeExpenseGroupRecord(
                    date = date,
                    entries = entries.map { (_, value) ->
                        IncomeExpenseEntryRecord(
                            type = value.type,
                            amount = value.amount,
                        )
                    }.sortedByDescending { it.amount }
                )
            }
            .sortedBy { it.date }

    private data class TopFlowKey(
        val date: LocalDate,
        val account: Account,
    )

    private data class TopFlowAggregation(
        val date: LocalDate,
        val account: Account,
        val amount: Amount,
    )

    private data class IncomeExpenseKey(
        val date: LocalDate,
        val type: AccountType,
    )

    private data class IncomeExpenseAggregation(
        val date: LocalDate,
        val type: AccountType,
        val amount: Amount,
    )

}