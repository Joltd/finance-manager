package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.ReferenceService
import com.evgenltd.financemanager.report.record.CategoryChartRecord
import com.evgenltd.financemanager.report.record.CategoryChartSettingsRecord
import com.evgenltd.financemanager.transaction.record.FlowRecord
import com.evgenltd.financemanager.transaction.service.FundGraphService
import org.springframework.stereotype.Service

@Service
class CategoryChartService(
    private val referenceService: ReferenceService,
    private val fundGraphService: FundGraphService
) {

    fun load(settings: CategoryChartSettingsRecord): CategoryChartRecord = when (settings.groupBy) {
        "expense" -> loadExpensesChart(settings)
        "income" -> loadIncomeChart(settings)
        else -> throw IllegalArgumentException("Unknown groupBy [${settings.groupBy}]")
    }

    private fun loadExpensesChart(settings: CategoryChartSettingsRecord): CategoryChartRecord {
        val categoryIndex = referenceService.expenseCategoryIndex()
        return fundGraphService.loadFlows(settings.dateFrom, settings.dateTo, settings.currency)
            .expenses
            .prepareChartRecord(categoryIndex, settings.expenseCategories)
    }

    private fun loadIncomeChart(settings: CategoryChartSettingsRecord): CategoryChartRecord {
        val categoryIndex = referenceService.incomeCategoryIndex()
        return fundGraphService.loadFlows(settings.dateFrom, settings.dateTo, settings.currency)
            .incomes
            .prepareChartRecord(categoryIndex, settings.incomeCategories)
    }

    private fun List<FlowRecord>.prepareChartRecord(
        categoryIndex: Map<String,String>,
        categories: List<String>
    ): CategoryChartRecord = filter { it.category in categories }
        .groupBy { it.category }
        .entries
        .map { it.key to it.value.map { it.amount }.reduce { acc, amount -> acc + amount } }
        .sortedBy { it.first }
        .let { flows ->
            CategoryChartRecord(
                flows.map { Reference(it.first, categoryIndex[it.first] ?: "Unknown", false) },
                flows.map { it.second }
            )
        }

}