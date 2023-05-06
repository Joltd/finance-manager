package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSeriesRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.transaction.record.FlowRecord
import com.evgenltd.financemanager.transaction.service.FundGraphService
import org.springframework.stereotype.Service
import java.time.DayOfWeek
import java.time.LocalDate

@Service
class FlowChartService(private val fundGraphService: FundGraphService) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord = loadTotalChart(settings)

    private fun loadTotalChart(settings: FlowChartSettingsRecord): FlowChartRecord {
        var (incomes, expenses) = fundGraphService.loadFlows(settings.dateFrom, settings.dateTo, settings.currency)

        val categories = settings.expenseCategories + settings.incomeCategories
        expenses = expenses.filter { it.category in categories }
        incomes = incomes.filter { it.category in categories }

        val dates = (expenses.map { it.date } + incomes.map { it.date }).buildDateDimension(settings.groupBy)

        return FlowChartRecord(
            dates,
            listOf(
                FlowChartSeriesRecord(
                    "Expense",
                    expenses.groupByCategoryAndSummarize(dates, settings)
                ),
                FlowChartSeriesRecord(
                    "Income",
                    incomes.groupByCategoryAndSummarize(dates, settings)
                )
            )
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

    private fun List<FlowRecord>.groupByCategoryAndSummarize(dates: List<LocalDate>, settings: FlowChartSettingsRecord): List<Amount> {
        val flowsByDate = groupBy { it.date.grouped(settings.groupBy) }
            .entries
            .map { it.key to it.value.sum() }
            .associate { it }
        return dates.map { date -> flowsByDate[date] ?: Amount(0, settings.currency) }
    }

    private fun List<FlowRecord>.sum() = map { it.amount }.reduce { acc, amount -> acc + amount }

    private fun LocalDate.grouped(group: String): LocalDate = when (group) {
        "week" -> with(DayOfWeek.MONDAY)
        else -> withDayOfMonth(1)
    }

    private fun LocalDate.addGroupStep(group: String): LocalDate = when (group) {
        "week" -> plusWeeks(1L)
        else -> plusMonths(1L)
    }

}