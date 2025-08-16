package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.report.record.CurrentFundsChartAmountEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartSettingsRecord
import com.evgenltd.financemanager.account.service.TurnoverService
import com.evgenltd.financemanager.account.service.sliceLast
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class CurrentFundsChartService(
    private val accountConverter: AccountConverter,
    private val turnoverService: TurnoverService,
    private val exchangeRateService: ExchangeRateService,
) {

    fun load(settings: CurrentFundsChartSettingsRecord): CurrentFundsChartRecord = turnoverService.listByAccountType()
        .sliceLast()
        .values
        .groupBy { it.account.id!! }
        .map {
            val amounts = it.value
                .map { value ->
                    val rate = exchangeRateService.rate(LocalDate.now().minusDays(1L), value.cumulativeAmount.currency, ExchangeRateService.DEFAULT_TARGET_CURRENCY).rate
                    CurrentFundsChartAmountEntryRecord(
                        amount = value.cumulativeAmount,
                        commonAmount = value.cumulativeAmount.convert(rate, ExchangeRateService.DEFAULT_TARGET_CURRENCY)
                    )
                }
                .filter { entry -> entry.amount.isNotZero() }
                .sortedByDescending { entry -> entry.amount.value }
            CurrentFundsChartEntryRecord(
                account = accountConverter.toRecord(it.value.first().account),
                commonAmount = amounts.fold(emptyAmount(ExchangeRateService.DEFAULT_TARGET_CURRENCY)) { acc, entry -> acc + entry.commonAmount },
                amounts = amounts
            )
        }
        .filter { it.commonAmount.isNotZero() }
        .sortedByDescending { it.commonAmount.value }
        .let { CurrentFundsChartRecord(it) }

}
