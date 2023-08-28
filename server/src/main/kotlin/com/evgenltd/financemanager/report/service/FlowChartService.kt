package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.report.record.FLowChartAverageRecord
import com.evgenltd.financemanager.report.record.FlowChartSeriesRecord
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class FlowChartService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord {

        val start = settings.dateFrom.withDayOfMonth(1)
        val dates = generateSequence(start) {
            it.plusMonths(1).takeIf { date -> !date.isAfter(settings.dateTo) }
        }.toList()

        val emptyAmount = emptyAmount(settings.currency)

        val series = transactionService.findTransactions(settings.dateFrom, settings.dateTo, settings.categories)
            .groupingBy {
                if (settings.total) {
                    it.account.type.name
                } else {
                    it.account.name
                }
            }
            .aggregate { _, accumulator: MutableMap<LocalDate,Amount>?, transaction, _ ->
                val date = transaction.date.withDayOfMonth(1)
                val entries = accumulator ?: dates.associateWith { emptyAmount }.toMutableMap()
                entries.compute(date) { _, accumulatedAmount ->
                    (accumulatedAmount ?: emptyAmount) + transaction.signedAmount().convertTo(transaction.date, settings.currency)
                }
                entries
            }
            .map {
                FlowChartSeriesRecord(
                    name = it.key,
                    values = it.value.entries
                        .sortedBy { entry -> entry.key }
                        .map { entry -> entry.value.toBigDecimal() }
                )
            }
            .sortedBy { it.name }

        val averages = series.map {
            FLowChartAverageRecord(
                name = it.name,
                value = it.values.sumOf { value -> value } / it.values.size.toBigDecimal()
            )
        }.sortedBy { it.name }

        return FlowChartRecord(
            dates = dates,
            series = series,
            averages = averages
        )

    }

    private fun Amount.convertTo(date: LocalDate, target: String): Amount {
        val rate = exchangeRateService.rate(date, currency, target)
        return (toBigDecimal() * rate).fromFractional(target)
    }

}