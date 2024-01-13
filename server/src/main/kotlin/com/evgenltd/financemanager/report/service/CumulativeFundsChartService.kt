package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.report.record.CumulativeFundsChartRecord
import com.evgenltd.financemanager.report.record.CumulativeFundsChartSettingsRecord
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate

@Service
class CumulativeFundsChartService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: CumulativeFundsChartSettingsRecord): CumulativeFundsChartRecord {
        val dateFrom = settings.dateFrom.withDayOfMonth(1)
        val dateTo = LocalDate.now()
        val dates = generateSequence(dateFrom) {
            it.plusMonths(1).takeIf { date -> date < dateTo }
        }

        val transactions = transactionService.findTransactions(AccountType.ACCOUNT)
        var cumulativeAmount = transactions.filter { it.date < dateFrom }
            .map { it.signedAmount().convertTo(it.date, settings.currency) }
            .fold(emptyAmount(settings.currency)) { acc, amount -> acc + amount }

        val amounts = dates.associateWith { emptyAmount(settings.currency) }.toMutableMap()

        transactions.filter { it.date >= dateFrom }
            .onEach {
                val date = it.date.withDayOfMonth(1)
                val amount = it.signedAmount().convertTo(it.date, settings.currency)
                amounts.compute(date) { _, acc -> (acc ?: emptyAmount(settings.currency)) + amount }
            }

        val values = amounts.entries
            .sortedBy { it.key }
            .map { entry ->
                cumulativeAmount.also { cumulativeAmount =+ entry.value + cumulativeAmount }
            }
            .map { it.toBigDecimal().setScale(0, RoundingMode.HALF_UP) }
            .toList()

        return CumulativeFundsChartRecord(
            dates = dates.toList(),
            values = values,
        )
    }

    private fun Amount.convertTo(date: LocalDate, target: String): Amount {
        if (currency == "TRX") {
            return emptyAmount(target)
        }
        val rate = exchangeRateService.rateStartOfWeek(date, currency, target)
        return (toBigDecimal() * rate).fromFractional(target)
    }

}