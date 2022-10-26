package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.report.record.AccountBalanceRecord
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
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
                            AccountBalanceRecord(
                                    accountIndex[it.key]?.name ?: "Unknown",
                                    it.value.sum()
                            )
                        }
        )
    }

    private fun List<AccountTransaction>.sum(): List<Amount> = this.map { it.amount }
            .groupBy { it.currency }
            .map { Amount(it.value.sum(), it.key) }

    private fun List<Amount>.sum() = sumOf { it.value }

}