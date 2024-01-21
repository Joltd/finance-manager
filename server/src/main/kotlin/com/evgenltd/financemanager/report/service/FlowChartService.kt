package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.report.record.FlowChartEntryRecord
import com.evgenltd.financemanager.report.record.FlowChartGroupRecord
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.turnover.entity.Turnover
import com.evgenltd.financemanager.turnover.service.TurnoverService
import org.springframework.stereotype.Service

@Service
class FlowChartService(
    private val turnoverService: TurnoverService,
) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord {

        val turnovers = turnoverService.list(settings.filter)

        val start = turnovers.minOfOrNull { it.date }
        val end = turnovers.maxOfOrNull { it.date }
        val dates = generateSequence(start) {
            it.plusMonths(1).takeIf { date -> !date.isAfter(end) }
        }.toList()
        val emptyAmount = emptyAmount("USD")

        val groups = turnovers.filter { it.account.type != AccountType.ACCOUNT }
            .groupBy { it.date }
            .map { entry ->
                val entries = entry.value
                    .groupingBy {
                        if (settings.category) {
                            GroupKey(it.account.id.toString(), it.account.name)
                        } else {
                            GroupKey(it.account.type.name, it.account.type.name)
                        }
                    }
                    .aggregate { _, accumulator: Amount?, turnover, _ ->
                        (accumulator ?: emptyAmount) + turnover.amountUsd
                    }
                    .map { (key, value) ->
                        val actualValue = if (!settings.category && key.id == AccountType.INCOME.name) {
                            value.toBigDecimal().negate()
                        } else {
                            value.toBigDecimal()
                        }
                        FlowChartEntryRecord(
                            id = key.id,
                            name = key.name,
                            value = actualValue
                        )
                    }
                entry.key to entries
            }
            .associate { it }

        return dates
            .map {  date ->
                val entries = groups[date] ?: emptyList()
                val sorted = if (settings.category) {
                    entries.sortedByDescending { it.value }.take(5)
                } else {
                    entries.sortedBy { it.name }
                }
                FlowChartGroupRecord(
                    date = date,
                    entries = sorted
                )
            }
            .sortedByDescending { it.date }
            .let { FlowChartRecord(it) }

    }

    private data class GroupKey(
        val id: String,
        val name: String,
    )

}
