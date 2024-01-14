package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.entity.service.EntityService
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSeriesRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.turnover.service.TurnoverService
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class FlowChartService(
    private val turnoverService: TurnoverService,
) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord {

        val turnovers = turnoverService.list(settings.filter)

        val start = turnovers.minOf { it.date }
        val end = turnovers.maxOf { it.date }
        val dates = generateSequence(start) {
            it.plusMonths(1).takeIf { date -> !date.isAfter(end) }
        }.toList()
        val emptyAmount = emptyAmount("USD")

        val series = turnovers
            .groupingBy {
                if (settings.total) {
                    Key(it.account.type.name, it.account.type.name)
                } else {
                    Key(it.account.id.toString(), it.account.name)
                }
            }
            .aggregate { _, accumulator: MutableMap<LocalDate,Amount>?, turnover, _ ->
                val date = turnover.date.withDayOfMonth(1)
                val entries = accumulator ?: dates.associateWith { emptyAmount }.toMutableMap()
                entries.compute(date) { _, accumulatedAmount ->
                    (accumulatedAmount ?: emptyAmount) + turnover.amountUsd
                }
                entries
            }
            .map {
                val values = it.value.entries
                    .sortedBy { entry -> entry.key }
                    .map { entry -> entry.value.toBigDecimal() }
                val average = values.sumOf { value -> value } / values.size.toBigDecimal()
                FlowChartSeriesRecord(
                    id = it.key.id,
                    name = it.key.name,
                    values = values + if (settings.showAverage) listOf(average) else emptyList()
                )
            }
            .sortedBy { it.name }

        return FlowChartRecord(
            dates = dates.map { it.toString() } + if (settings.showAverage) listOf("Average") else emptyList(),
            series = series
        )

    }

    private data class Key(val id: String, val name: String)

}
