package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSeriesRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.LocalDate

@Service
class FlowChartService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord = loadTotalChart(settings)

    private fun loadTotalChart(settings: FlowChartSettingsRecord): FlowChartRecord {
        val transactions = transactionService.findTransactions(settings.dateFrom, settings.dateTo)
            .filter { it.incomeCategory in settings.incomeCategories || it.expenseCategory in settings.expenseCategories }

        val dates = transactions.map { it.date }.buildDateDimension(settings.groupBy)

        val expenseByDate = transactions.filter { it.expenseCategory != null }
            .groupBy { it.date.grouped(settings.groupBy) }
            .entries
            .map { it.key to it.value.sum(settings.currency) }
            .associate { it }

        val incomeByDate = transactions.filter { it.incomeCategory != null }
            .groupBy { it.date.grouped(settings.groupBy) }
            .entries
            .map { it.key to it.value.sum(settings.currency) }
            .associate { it }

        return FlowChartRecord(
            dates,
            listOf(
                FlowChartSeriesRecord(
                    "Expense",
                    dates.map { date -> expenseByDate[date] ?: Amount(0, settings.currency) }
                ),
                FlowChartSeriesRecord(
                    "Income",
                    dates.map { date -> incomeByDate[date] ?: Amount(0, settings.currency) }
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

    private fun LocalDate.grouped(group: String): LocalDate = when (group) {
        "week" -> with(DayOfWeek.MONDAY)
        else -> withDayOfMonth(1)
    }

    private fun LocalDate.addGroupStep(group: String): LocalDate = when (group) {
        "week" -> plusWeeks(1L)
        else -> plusMonths(1L)
    }

    private fun List<Transaction>.sum(currency: String) = map { it.amount().convertTo(it.date, currency) }
        .reduce { acc, amount -> acc + amount }

    private fun Amount.convertTo(date: LocalDate, target: String): Amount = Amount(toBigDecimal().multiply(rate(date, currency, target)).toAmountValue(), target)

    private fun rate(date: LocalDate, from: String, to: String): BigDecimal = exchangeRateService.rate(date, from, to)

}