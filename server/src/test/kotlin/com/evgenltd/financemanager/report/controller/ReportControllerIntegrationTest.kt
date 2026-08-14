package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRateHistory
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateHistoryRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.report.record.IncomeExpenseFilter
import com.evgenltd.financemanager.report.record.IncomeExpenseReportRecord
import com.evgenltd.financemanager.report.record.TaggedFlowFilter
import com.evgenltd.financemanager.report.record.TaggedFlowReportRecord
import com.evgenltd.financemanager.report.record.TopFlowFilter
import com.evgenltd.financemanager.report.record.TopFlowReportRecord
import com.evgenltd.financemanager.tag.entity.Tag
import com.evgenltd.financemanager.tag.repository.TagRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import java.math.BigDecimal
import java.time.LocalDate

/**
 * All amounts are seeded in USD (BASE_CURRENCY, the default target currency with no Settings
 * row). Unlike DashboardService's total-balance calc, these week-bucketed reports go through
 * ExchangeRateHistoryIndex.toTarget(date, amount), which has NO same-currency short-circuit of
 * its own - it only delegates to one once a per-date ExchangeRateIndex exists, and that only
 * happens for weeks with a seeded ExchangeRateHistory row. With none seeded, every amount would
 * resolve to zero and get filtered out (isNotZero()) regardless of currency. So each test seeds
 * an ExchangeRateHistory(USD, rate=1) row for the Monday of the week its transactions fall in.
 * No Currency rows are seeded, so the gap-filling gatherer short-circuits before ever touching
 * a real/stub provider.
 */
class ReportControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var transactionService: TransactionService

    @Autowired
    private lateinit var tagRepository: TagRepository

    @Autowired
    private lateinit var exchangeRateHistoryRepository: ExchangeRateHistoryRepository

    private lateinit var bankAccount: Account
    private lateinit var expenseCategory: Account
    private lateinit var incomeCategory: Account

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        exchangeRateHistoryRepository.deleteAll()
        withTenant { tagRepository.deleteAll() }
        withTenant {
            bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            expenseCategory = accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
            incomeCategory = accountRepository.save(Account(name = "Salary", type = AccountType.INCOME))
        }
        // 2024-01-15 is itself a Monday; both weeks used below fall in it.
        exchangeRateHistoryRepository.save(ExchangeRateHistory(id = null, date = LocalDate.of(2024, 1, 15), currency = "USD", value = BigDecimal.ONE))
    }

    @Test
    fun `incomeExpenseReport - groups income and expense transactions by month`() {
        withTenant {
            val expense = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 15), 500_000L))
            transactionService.save(expense)
            val income = operationRepository.save(incomeOperation(LocalDate.of(2024, 1, 20), 2_000_000L))
            transactionService.save(income)
        }

        val response = restClient.post()
            .uri("/api/v1/report/income-expense")
            .headers { it.addAll(authHeaders()) }
            .body(IncomeExpenseFilter(date = DateRange(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31))))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<IncomeExpenseReportRecord>>() {})

        val groups = response!!.body!!.groups
        assertThat(groups).hasSize(1)
        assertThat(groups.first().date).isEqualTo(LocalDate.of(2024, 1, 1))
        assertThat(groups.first().balance).isEqualTo(Amount(1_500_000L, "USD")) // income - expense
        assertThat(groups.first().entries).extracting("type", "amount")
            .containsExactlyInAnyOrder(
                org.assertj.core.groups.Tuple.tuple(AccountType.INCOME, Amount(2_000_000L, "USD")),
                org.assertj.core.groups.Tuple.tuple(AccountType.EXPENSE, Amount(500_000L, "USD")),
            )
    }

    @Test
    fun `topFlowReport - groups expenses by month and category`() {
        withTenant {
            // Deliberately not the Monday (2024-01-15) the ExchangeRateHistory row is seeded on:
            // a single transaction dated exactly on that Monday makes historyRates' half-open
            // [from, to) range degenerate to zero width (from == to, via withNextMonday()'s
            // nextOrSame on an already-Monday date), excluding that very date from the lookup.
            val expense = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 16), 500_000L))
            transactionService.save(expense)
        }

        val response = restClient.post()
            .uri("/api/v1/report/top-flow")
            .headers { it.addAll(authHeaders()) }
            .body(TopFlowFilter(date = DateRange(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31))))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<TopFlowReportRecord>>() {})

        val groups = response!!.body!!.groups
        assertThat(groups).hasSize(1)
        assertThat(groups.first().amount).isEqualTo(Amount(500_000L, "USD"))
        assertThat(groups.first().entries).extracting("account.name").containsExactly("Food")
    }

    @Test
    fun `taggedFlowReport - sums transactions carrying the given tag`() {
        val tag = withTenant { tagRepository.save(Tag(name = "Trip")) }
        withTenant {
            // See the comment in the topFlowReport test above for why this avoids the seeded
            // rate's exact Monday (2024-01-15).
            val expense = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 16), 500_000L).also { it.tags = mutableListOf(tag) })
            transactionService.save(expense)
            val untaggedExpense = operationRepository.save(expenseOperation(LocalDate.of(2024, 1, 17), 100_000L))
            transactionService.save(untaggedExpense)
        }

        val response = restClient.post()
            .uri("/api/v1/report/tagged-flow")
            .headers { it.addAll(authHeaders()) }
            .body(TaggedFlowFilter(tag = tag.id!!))
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<TaggedFlowReportRecord>>() {})

        val report = response!!.body!!
        // The matched transaction is the IN leg on the expense-category account, which
        // taggedFlowReport negates so expenses net out as negative flow.
        assertThat(report.total).isEqualTo(Amount(-500_000L, "USD"))
        assertThat(report.entries).extracting("category.name").containsExactly("Food")
    }

    private fun expenseOperation(date: LocalDate, valueUsd: Long) = Operation(
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = Amount(valueUsd, "USD"),
        accountFrom = bankAccount,
        amountTo = Amount(valueUsd, "USD"),
        accountTo = expenseCategory,
        description = "",
    )

    private fun incomeOperation(date: LocalDate, valueUsd: Long) = Operation(
        date = date,
        type = OperationType.INCOME,
        amountFrom = Amount(valueUsd, "USD"),
        accountFrom = incomeCategory,
        amountTo = Amount(valueUsd, "USD"),
        accountTo = bankAccount,
        description = "",
    )
}
