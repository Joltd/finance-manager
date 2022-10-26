package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.report.record.AccountBalanceRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import org.springframework.stereotype.Service

@Service
class DashboardService(
        private val accountRepository: AccountRepository,
        private val accountTransactionRepository: AccountTransactionRepository
) {

    fun load(): DashboardRecord {
        val accountIndex = accountRepository.findAll().associateBy { it.id }
        return DashboardRecord(
                accountTransactionRepository.findByAccountNotNull()
                        .groupBy { it.account }
                        .map {
                            val account = accountIndex[it.key]
                            AccountBalanceRecord(
                                    account?.id,
                                    account?.name ?: "Unknown",
                                    it.value.sumByCurrency()
                            )
                        }
        )
    }

    private fun List<AccountTransaction>.sumByCurrency(): List<Amount> = this.groupBy { it.amount.currency }
            .map { Amount(it.value.sum(), it.key) }

    private fun List<AccountTransaction>.sum() = sumOf {
        if (it.direction == Direction.IN) {
            it.amount.value
        } else {
            -it.amount.value
        }
    }

}