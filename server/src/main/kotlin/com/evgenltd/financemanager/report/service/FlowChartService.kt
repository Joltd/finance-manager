package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.report.record.FlowChartEntryRecord
import com.evgenltd.financemanager.report.record.FlowChartRecord
import com.evgenltd.financemanager.report.record.FlowChartSettingsRecord
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.service.TransactionService
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class FlowChartService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: FlowChartSettingsRecord): FlowChartRecord {
        val entries = transactionService.findTransactions(settings.dateFrom, settings.dateTo)
            .filter { settings.type == null || it.type == settings.type }
            .filter { it.account.id in settings.categories }
            .map { it.toEntry(settings.commonCurrency) }
        return FlowChartRecord(entries)
    }

    private fun Transaction.toEntry(commonCurrency: String): FlowChartEntryRecord = FlowChartEntryRecord(
        date = date,
        type = type,
        category = account.id!!,
        amount = amount,
        commonAmount = amount.convertTo(date, commonCurrency)
    )

    private fun Amount.convertTo(date: LocalDate, target: String): Amount = (toBigDecimal() * rate(date, currency, target))
        .let { Amount(it.toAmountValue(), target) }

    private fun rate(date: LocalDate, from: String, to: String): BigDecimal = exchangeRateService.rate(date, from, to)

}