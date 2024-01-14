package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.report.record.CurrentFundsChartAmountEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartSettingsRecord
import com.evgenltd.financemanager.turnover.service.TurnoverService
import com.evgenltd.financemanager.turnover.service.sliceLast
import org.springframework.stereotype.Service

@Service
class CurrentFundsChartService(
    private val accountConverter: AccountConverter,
    private val turnoverService: TurnoverService,
) {

    fun load(settings: CurrentFundsChartSettingsRecord): CurrentFundsChartRecord = turnoverService.listByAccountType()
        .sliceLast()
        .values
        .groupBy { it.account.id!! }
        .map {
            CurrentFundsChartEntryRecord(
                account = accountConverter.toRecord(it.value.first().account),
                commonAmount = it.value.fold(emptyAmount("USD")) { acc, entry -> acc + entry.cumulativeAmountUsd },
                amounts = it.value
                    .map { value ->
                        CurrentFundsChartAmountEntryRecord(
                            amount = value.cumulativeAmount,
                            commonAmount = value.cumulativeAmountUsd
                        )
                    }
                    .sortedByDescending { entry -> entry.amount.value }
            )
        }
        .filter { it.commonAmount.isNotZero() }
        .sortedByDescending { it.commonAmount.value }
        .let { CurrentFundsChartRecord(it) }

}
