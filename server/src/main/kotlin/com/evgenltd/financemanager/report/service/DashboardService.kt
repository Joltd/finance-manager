package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.service.ReferenceService
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
        val firstCurrency = "USD"
        val secondCurrency = "RUB"

        val funds = transactionService.findAll()
            .groupBy { it.account to it.amount.currency }
            .map { (accountCurrency, transactions) ->
                val amount = transactions.map { it.amountWithDirection() }.reduce { acc, amount -> acc + amount }
                val commonAmount = exchangeRateService.rate(LocalDate.now(), amount.currency, firstCurrency) * amount.toBigDecimal()
                FundRecord(
                    account = accountCurrency.first,
                    amount = amount,
                    commonAmount = Amount(commonAmount.toAmountValue(), firstCurrency)
                )
            }
            .filter { it.commonAmount.toBigDecimal().signum() > 0 }

        val usdTotal = funds.sumOf { it.commonAmount.toBigDecimal() }

        val rubTotal = funds.sumOf {
            val rate = exchangeRateService.rate(LocalDate.now(), it.amount.currency, secondCurrency)
            it.amount.toBigDecimal() * rate
        }

        return DashboardRecord(
            funds = funds,
            fundsTotal = Amount(usdTotal.toAmountValue(), firstCurrency),
            fundsTotalSecondary = Amount(rubTotal.toAmountValue(), secondCurrency)
        )
    }

    private fun Transaction.amountWithDirection(): Amount = if (direction == Direction.OUT) -amount else amount

}