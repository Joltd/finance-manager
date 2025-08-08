package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.report.record.CumulativeFundsChartRecord
import com.evgenltd.financemanager.report.record.CumulativeFundsChartSettingsRecord
import com.evgenltd.financemanager.turnover.service.TurnoverService
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate

@Service
class CumulativeFundsChartService(
    private val turnoverService: TurnoverService,
) {

    fun load(settings: CumulativeFundsChartSettingsRecord): CumulativeFundsChartRecord {
        val dateFrom = settings.dateFrom.withDayOfMonth(1)
        val dateTo = LocalDate.now()
        val dates = generateSequence(dateFrom) {
            it.plusMonths(1).takeIf { date -> date < dateTo }
        }
        val emptyAmount = emptyAmount("USD")

        val turnovers = turnoverService.listByAccountType()

//        var cumulativeAmount = turnovers
//            .filter { it.date < dateFrom }
//            .sliceLast()
//            .map { it.value.cumulativeAmountUsd }
//            .fold(emptyAmount) { acc, amount -> acc + amount }
//
//        val amounts = turnovers.filter { it.date >= dateFrom }
//            .groupingBy { it.date }
//            .aggregate { _, accumulator: Amount?, turnover, _ ->
//                accumulator?.plus(turnover.amountUsd) ?: turnover.amountUsd
//            }

        val values = dates
            .map { entry ->
//                val amount = (amounts[entry] ?: emptyAmount)
//                cumulativeAmount = amount + cumulativeAmount
//                cumulativeAmount
                emptyAmount("USD")
            }
            .map { it.toBigDecimal().setScale(0, RoundingMode.HALF_UP) }
            .toList()

        return CumulativeFundsChartRecord(
            dates = dates.toList(),
            values = values,
        )
    }

}