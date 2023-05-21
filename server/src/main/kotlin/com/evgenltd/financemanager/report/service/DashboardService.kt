package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.record.FundRecord
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class DashboardService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(): DashboardRecord {
        val funds = transactionService.findAll()
            .groupBy { it.amount.currency }
            .map { (_, transactions) ->
                transactions.map { it.amountWithDirection() }
                    .reduce { acc, amount -> acc + amount }
            }

        val usdFunds = funds.map {
            val rate = exchangeRateService.rate(LocalDate.now(), it.currency, "USD")
            it to it.toBigDecimal() * rate
        }
        val usdTotal = usdFunds.sumOf { it.second }

        val rubTotal = funds.sumOf {
            val rate = exchangeRateService.rate(LocalDate.now(), it.currency, "RUB")
            it.toBigDecimal() * rate
        }

        return DashboardRecord(
            funds = usdFunds.map { FundRecord(it.first, (it.second / usdTotal * BigDecimal(100)).toInt()) },
            fundsTotal = Amount(usdTotal.toAmountValue(), "USD"),
            fundsTotalSecondary = Amount(rubTotal.toAmountValue(), "RUB")
        )
    }

    private fun Transaction.amountWithDirection(): Amount = if (direction == Direction.OUT) -amount else amount

}