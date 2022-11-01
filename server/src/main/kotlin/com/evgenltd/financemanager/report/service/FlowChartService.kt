package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.entity.ExpenseCategory
import com.evgenltd.financemanager.reference.entity.IncomeCategory
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.FlowRecord
import com.evgenltd.financemanager.report.record.FlowSeriesRecord
import com.evgenltd.financemanager.report.record.FlowSettingsRecord
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.repository.ExpenseTransactionRepository
import com.evgenltd.financemanager.transaction.repository.IncomeTransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.LocalDate

@Service
class FlowChartService(
        private val referenceService: ReferenceService,
        private val expenseTransactionRepository: ExpenseTransactionRepository,
        private val incomeTransactionRepository: IncomeTransactionRepository,
        private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: FlowSettingsRecord): FlowRecord = when (settings.type) {
        "expense" -> loadExpensesChart(settings)
        "income" -> loadIncomesChart(settings)
        else -> loadTotalChart(settings)
    }

    private fun loadTotalChart(settings: FlowSettingsRecord): FlowRecord {
        val expenses = expenseTransactionRepository.findByExpenseCategoryNotNull()
                .filter { !it.date.isBefore(settings.dateFrom) && !it.date.isAfter(settings.dateTo) }
        val incomes = incomeTransactionRepository.findByIncomeCategoryNotNull()
                .filter { !it.date.isBefore(settings.dateFrom) && !it.date.isAfter(settings.dateTo) }

        val dates = (expenses.map { it.date } + incomes.map { it.date }).buildDateDimension(settings.groupBy)

        val expenseByDate = expenses.groupBy { it.date.grouped(settings.groupBy) }
                .entries
                .map { it.key to it.value.sumExpenses(settings.currency) }
                .associate { it }

        val incomeByDate = incomes.groupBy { it.date.grouped(settings.groupBy) }
                .entries
                .map { it.key to it.value.sumIncomes(settings.currency) }
                .associate { it }

        return FlowRecord(
                dates,
                listOf(
                        FlowSeriesRecord(
                                "Expense",
                                dates.map { date -> expenseByDate[date] ?: Amount(0, settings.currency) }
                        ),
                        FlowSeriesRecord(
                                "Income",
                                dates.map { date -> incomeByDate[date] ?: Amount(0, settings.currency) }
                        )
                )
        )
    }

    private fun loadExpensesChart(settings: FlowSettingsRecord): FlowRecord {
        val expenses = expenseTransactionRepository.findByExpenseCategoryNotNull()
                .filter { !it.date.isBefore(settings.dateFrom) && !it.date.isAfter(settings.dateTo) }

        val dates = expenses.map { it.date }.buildDateDimension(settings.groupBy)

        val expenseIndex = referenceService.expenseCategoryIndex()
        val expenseByDateAndCategory = expenses.groupBy { FlowGroup(it.date.grouped(settings.groupBy), expenseIndex.expenseName(it.expenseCategory)) }
                .entries
                .map { it.key to it.value.sumExpenses(settings.currency) }
                .associate { it }
        val incomeSeries = expenses.map { expenseIndex.expenseName(it.expenseCategory) }
                .toSet()
                .map {
                    FlowSeriesRecord(
                            it,
                            dates.map { date -> expenseByDateAndCategory[FlowGroup(date, it)] ?: Amount(0, settings.currency) }
                    )
                }
        return FlowRecord(
                dates,
                incomeSeries
        )
    }

    private fun loadIncomesChart(settings: FlowSettingsRecord): FlowRecord {
        val incomes = incomeTransactionRepository.findByIncomeCategoryNotNull()
                .filter { !it.date.isBefore(settings.dateFrom) && !it.date.isAfter(settings.dateTo) }

        val dates = incomes.map { it.date }.buildDateDimension(settings.groupBy)

        val incomeIndex = referenceService.incomeCategoryIndex()
        val incomeByDateAndCategory = incomes.groupBy { FlowGroup(it.date.grouped(settings.groupBy), incomeIndex.incomeName(it.incomeCategory)) }
                .entries
                .map { it.key to it.value.sumIncomes(settings.currency) }
                .associate { it }
        val incomeSeries = incomes.map { incomeIndex.incomeName(it.incomeCategory) }
                .toSet()
                .map {
                    FlowSeriesRecord(
                            it,
                            dates.map { date -> incomeByDateAndCategory[FlowGroup(date, it)] ?: Amount(0, settings.currency) }
                    )
                }
        return FlowRecord(
                dates,
                incomeSeries
        )
    }

    private fun List<LocalDate>.buildDateDimension(group: String): List<LocalDate> {
        val flowDates = map { it.grouped(group) }.toSet()
        if (flowDates.isEmpty()) {
            return emptyList()
        }
        val minDate = flowDates.minOf { it }
        val maxDate = flowDates.maxOf { it }
        val dimension = mutableListOf<LocalDate>()
        var date = minDate
        while (!date.isAfter(maxDate)) {
            dimension.add(date)
            date = date.addGroupStep(group)
        }
        return dimension
    }

    private fun LocalDate.grouped(group: String): LocalDate = when (group) {
        "week" -> with(DayOfWeek.MONDAY)
        else -> withDayOfMonth(1)
    }

    private fun LocalDate.addGroupStep(group: String): LocalDate = when (group) {
        "week" -> plusWeeks(1L)
        else -> plusMonths(1L)
    }

    private fun List<ExpenseTransaction>.sumExpenses(currency: String) =
            map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun List<IncomeTransaction>.sumIncomes(currency: String) =
            map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun Map<String, ExpenseCategory>.expenseName(id: String) = this[id]?.name ?: "Unknown expense"

    private fun Map<String, IncomeCategory>.incomeName(id: String) = this[id]?.name ?: "Unknown income"

    private fun Amount.convertTo(date: LocalDate, target: String): Amount =
            Amount(
                    toBigDecimal().multiply(rate(date, currency, target)).toAmountValue(),
                    target
            )

    private fun rate(date: LocalDate, from: String, to: String): BigDecimal =
            exchangeRateService.rate(date, from, to)

    private data class FlowGroup(val date: LocalDate, val category: String)
}