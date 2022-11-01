package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.*
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import com.evgenltd.financemanager.transaction.repository.ExpenseTransactionRepository
import com.evgenltd.financemanager.transaction.repository.IncomeTransactionRepository
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class DashboardService(
        private val referenceService: ReferenceService,
        private val transactionRepository: TransactionRepository,
        private val accountTransactionRepository: AccountTransactionRepository,
        private val expenseTransactionRepository: ExpenseTransactionRepository,
        private val incomeTransactionRepository: IncomeTransactionRepository,
        private val exchangeRateService: ExchangeRateService
) {

    fun load(): DashboardRecord {
        return DashboardRecord(
                loadAccountBalances(),
                loadFlowChart()
        )
    }

    private fun loadAccountBalances(): List<AccountBalanceRecord> {
        val accountIndex = referenceService.accountIndex()
        return accountTransactionRepository.findByAccountNotNull()
                .groupBy { it.account }
                .map {
                    val account = accountIndex[it.key]
                    AccountBalanceRecord(
                            account?.id,
                            account?.name ?: "Unknown",
                            it.value.sumByCurrency()
                    )
                }
    }

    private fun List<AccountTransaction>.sumByCurrency(): List<Amount> = this.groupBy { it.amount.currency }
            .map { Amount(it.value.sum(), it.key) }
            .filter { it.value != 0L }

    private fun List<AccountTransaction>.sum() = sumOf {
        if (it.direction == Direction.IN) {
            it.amount.value
        } else {
            -it.amount.value
        }
    }

    private fun loadFlowChart(): FlowRecord {

        val currency = "USD"
        val expenses = expenseTransactionRepository.findByExpenseCategoryNotNull()
                .filter { it.date.monthValue > 8 }
        val incomes = incomeTransactionRepository.findByIncomeCategoryNotNull()
                .filter { it.date.monthValue > 8 }

        val dates = buildDateDimension(expenses, incomes)

        val expenseIndex = referenceService.expenseCategoryIndex()
        val expenseByDateAndCategory = expenses.groupBy { FlowGroup(it.date.withDayOfMonth(1), expenseIndex.expenseName(it.expenseCategory)) }
                .entries
                .map { it.key to it.value.sumExpenses(currency) }
                .associate { it }
        val expenseSeries = expenses.map { expenseIndex.expenseName(it.expenseCategory) }
                .toSet()
                .map {
                    FlowSeriesRecord(
                            "expense",
                            it,
                            dates.map { date -> expenseByDateAndCategory[FlowGroup(date, it)] ?: Amount(0, currency) }
                    )
                }

        val incomeIndex = referenceService.incomeCategoryIndex()
        val incomeByDateAndCategory = incomes.groupBy { FlowGroup(it.date.withDayOfMonth(1), incomeIndex.incomeName(it.incomeCategory)) }
                .entries
                .map { it.key to it.value.sumIncomes(currency) }
                .associate { it }
        val incomeSeries = incomes.map { incomeIndex.incomeName(it.incomeCategory) }
                .toSet()
                .map {
                    FlowSeriesRecord(
                            "income",
                            it,
                            dates.map { date -> incomeByDateAndCategory[FlowGroup(date, it)] ?: Amount(0, currency) }
                    )
                }

        return FlowRecord(
                dates,
                expenseSeries + incomeSeries
        )
    }

    private fun buildDateDimension(expenses: List<ExpenseTransaction>, incomes: List<IncomeTransaction>): List<LocalDate> {
        val flowDates = (expenses.map { it.date.withDayOfMonth(1) } + incomes.map { it.date.withDayOfMonth(1) })
                .toSet()
        if (flowDates.isEmpty()) {
            return emptyList()
        }
        val minDate = flowDates.minOf { it }
        val maxDate = flowDates.maxOf { it }
        val dimension = mutableListOf<LocalDate>()
        var date = minDate
        while (!date.isAfter(maxDate)) {
            dimension.add(date)
            date = date.plusMonths(1)
        }
        return dimension
    }

    private fun List<ExpenseTransaction>.sumExpenses(currency: String) =
            map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun List<IncomeTransaction>.sumIncomes(currency: String) =
            map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun Map<String,ExpenseCategory>.expenseName(id: String) = this[id]?.name ?: "Unknown expense"

    private fun Map<String,IncomeCategory>.incomeName(id: String) = this[id]?.name ?: "Unknown income"

    private fun Amount.convertTo(date: LocalDate, target: String): Amount =
            Amount(
                    toBigDecimal().multiply(rate(date, currency, target)).toAmountValue(),
                    target
            )

    private fun rate(date: LocalDate, from: String, to: String): BigDecimal =
            exchangeRateService.rate(date, from, to)

    private data class FlowGroup(val date: LocalDate, val category: String) {
//        override fun equals(other: Any?): Boolean {
//            if (this === other) return true
//            if (javaClass != other?.javaClass) return false
//
//            other as FlowGroup
//
//            if (date != other.date) return false
//            if (category != other.category) return false
//
//            return true
//        }
//
//        override fun hashCode(): Int {
//            var result = date.hashCode()
//            result = 31 * result + category.hashCode()
//            return result
//        }
    }
}