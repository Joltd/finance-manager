package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.CategoryChartRecord
import com.evgenltd.financemanager.report.record.CategoryChartSettingsRecord
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.repository.ExpenseTransactionRepository
import com.evgenltd.financemanager.transaction.repository.IncomeTransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class CategoryChartService(
    private val referenceService: ReferenceService,
    private val expenseTransactionRepository: ExpenseTransactionRepository,
    private val incomeTransactionRepository: IncomeTransactionRepository,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: CategoryChartSettingsRecord): CategoryChartRecord = when (settings.groupBy) {
        "expense" -> loadExpensesChart(settings)
        "income" -> loadIncomeChart(settings)
        else -> throw IllegalArgumentException("Unknown groupBy [${settings.groupBy}]")
    }

    private fun loadExpensesChart(settings: CategoryChartSettingsRecord): CategoryChartRecord {
        val referenceIndex = referenceService.expenseCategoryIndex()
        return expenseTransactionRepository.findByDate(settings.dateFrom, settings.dateTo)
            .filter { it.expenseCategory in settings.expenseCategories }
            .groupBy { it.expenseCategory }
            .entries
            .map { it.key to it.value.sumExpenses(settings.currency) }
            .sortedBy { it.second.value }
            .let { expenses ->
                CategoryChartRecord(
                    expenses.map { Reference(it.first, referenceIndex[it.first]?.name ?: "Unknown", false) },
                    expenses.map { it.second }
                )
            }
    }

    private fun loadIncomeChart(settings: CategoryChartSettingsRecord): CategoryChartRecord {
        val referenceIndex = referenceService.incomeCategoryIndex()
        return incomeTransactionRepository.findByDate(settings.dateFrom, settings.dateTo)
            .filter { it.incomeCategory in settings.incomeCategories }
            .groupBy { it.incomeCategory }
            .entries
            .map { it.key to it.value.sumIncomes(settings.currency) }
            .sortedBy { it.first }
            .let { incomes ->
                CategoryChartRecord(
                    incomes.map { Reference(it.first, referenceIndex[it.first]?.name ?: "Unknown", false) },
                    incomes.map { it.second }
                )
            }
    }

    private fun List<ExpenseTransaction>.sumExpenses(currency: String) =
        map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun List<IncomeTransaction>.sumIncomes(currency: String) =
        map { it.amount.convertTo(it.date, currency) }.reduce { acc, amount -> acc + amount }

    private fun Amount.convertTo(date: LocalDate, target: String): Amount =
        Amount(
            toBigDecimal().multiply(rate(date, currency, target)).toAmountValue(),
            target
        )

    private fun rate(date: LocalDate, from: String, to: String): BigDecimal =
        exchangeRateService.rate(date, from, to)

}