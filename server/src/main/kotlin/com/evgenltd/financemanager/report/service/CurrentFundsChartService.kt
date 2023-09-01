package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartAmountEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartSettingsRecord
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class CurrentFundsChartService(
    private val transactionService: TransactionService,
    private val exchangeRateService: ExchangeRateService
) {

    fun load(settings: CurrentFundsChartSettingsRecord): CurrentFundsChartRecord = transactionService.findTransactions(AccountType.ACCOUNT)
        .groupingBy { Key(it.account) }
        .aggregate { _, accumulator: MutableMap<String,Amount>?, transaction, _ ->
            val entries = (accumulator ?: mutableMapOf())
            entries.compute(transaction.amount.currency) {
                _, amount -> amount?.plus(transaction.amount) ?: transaction.amount
            }
            entries
        }
        .map {
            val amounts = it.value.values
                .map { amount ->
                    CurrentFundsChartAmountEntryRecord(
                        amount = amount,
                        commonAmount = amount.convertTo(LocalDate.now(), settings.currency)
                    )
                }
                .toList()
                .sortedByDescending { entry -> entry.amount.value }
            CurrentFundsChartEntryRecord(
                account = it.key.account.toRecord(),
                commonAmount = amounts.fold(emptyAmount(settings.currency)) { acc, entry -> acc + entry.commonAmount },
                amounts = amounts
            )
        }
        .sortedByDescending { it.commonAmount.value }
        .let { CurrentFundsChartRecord(it) }

    private fun Amount.convertTo(date: LocalDate, target: String): Amount {
        val rate = exchangeRateService.rate(date, currency, target)
        return (toBigDecimal() * rate).fromFractional(target)
    }

    private data class Key(val account: Account) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Key

            return account.id == other.account.id
        }

        override fun hashCode(): Int {
            return account.id.hashCode()
        }
    }
}
