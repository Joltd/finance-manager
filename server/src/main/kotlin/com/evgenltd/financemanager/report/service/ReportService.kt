package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.accountTypes
import com.evgenltd.financemanager.common.repository.accounts
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.currency
import com.evgenltd.financemanager.common.service.validHalfYear
import com.evgenltd.financemanager.common.service.withMonday
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.report.record.TopFlowCategoryEntryRecord
import com.evgenltd.financemanager.report.record.TopFlowEntryRecord
import com.evgenltd.financemanager.report.record.TopFlowFilter
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ReportService(
    private val transactionRepository: TransactionRepository,
    private val settingService: SettingService,
    private val exchangeRateService: ExchangeRateService,
    private val accountConverter: AccountConverter,
) {

    fun topFlowChart(filter: TopFlowFilter): List<TopFlowEntryRecord> {

        if (filter.type == AccountType.ACCOUNT) {
            throw IllegalArgumentException("Account type doesn't supported")
        }

        val targetCurrency = settingService.operationDefaultCurrency() ?: BASE_CURRENCY

        val transactions = ((Transaction::date between filter.date.validHalfYear()) and
                (Transaction::account accountTypes filter.type?.let { listOf(it) }) and
                (Transaction::amount currency filter.currency) and
                (Transaction::account accounts filter.categories))
            .let { transactionRepository.findAll(it) }

        if (transactions.isEmpty()) {
            return emptyList()
        }

        val currencies = transactions.map { it.amount.currency }.distinct()
        val actualRange = Range(
            transactions.minOf { it.date },
            transactions.maxOf { it.date }
        )

        val rateIndex = exchangeRateService.historyRateIndex(targetCurrency, actualRange, currencies)

        return transactions.map {
            TopFlowAggregation(
                date = it.date.withDayOfMonth(1),
                account = it.account,
                amount = rateIndex.toTarget(it.date.withMonday(), it.amount)
            )
        }.groupBy { it.date }
            .map { (date, transactions) ->
                val sortedTransactions = transactions.groupingBy { it.account }
                    .aggregate { _, accumulator: Amount?, element, _ -> element.amount + accumulator }
                    .map { (account, amount) -> account to amount }
                    .sortedByDescending { (_, amount) -> amount }
                    .map { (account, amount) -> TopFlowCategoryEntryRecord(accountConverter.toReference(account), amount) }

                val categories = sortedTransactions.take(3)
                val other = sortedTransactions.drop(3)
                    .map { (_, amount) -> amount }
                    .reduceOrNull { acc, amount -> acc + amount }
                    .let { TopFlowCategoryEntryRecord(amount = it ?: emptyAmount(targetCurrency)) }

                TopFlowEntryRecord(
                    date = date,
                    category1 = categories.getOrDefault(0, targetCurrency),
                    category2 = categories.getOrDefault(1, targetCurrency),
                    category3 = categories.getOrDefault(2, targetCurrency),
                    other = other,
                )
            }
    }

    private fun List<TopFlowCategoryEntryRecord>.getOrDefault(index: Int, targetCurrency: String): TopFlowCategoryEntryRecord = getOrNull(index)
        ?: TopFlowCategoryEntryRecord(amount = emptyAmount(targetCurrency))

    private data class TopFlowAggregation(
        val date: LocalDate,
        val account: Account,
        val amount: Amount,
    )

}