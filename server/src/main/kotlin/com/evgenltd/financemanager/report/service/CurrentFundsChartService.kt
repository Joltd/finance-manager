package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.service.TransactionService
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartEntryRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import org.springframework.stereotype.Service

@Service
class CurrentFundsChartService(
    private val transactionService: TransactionService
) {

    fun load(): CurrentFundsChartRecord = transactionService.findTransactions(AccountType.ACCOUNT)
        .groupingBy { Key(it.account) }
        .aggregate { _, accumulator: MutableMap<String,Amount>?, transaction, _ ->
            val entries = (accumulator ?: mutableMapOf())
            entries.compute(transaction.amount.currency) {
                _, amount -> amount?.plus(transaction.amount) ?: transaction.amount
            }
            entries
        }
        .map {
            CurrentFundsChartEntryRecord(
                account = it.key.account.toRecord(),
                amounts = it.value.values.toList().sortedBy { amount -> amount.currency }
            )
        }
        .sortedBy { it.account.name }
        .let { CurrentFundsChartRecord(it) }

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