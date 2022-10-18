package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import org.springframework.stereotype.Service

@Service
class AccountTransactionService(
        private val accountTransactionRepository: AccountTransactionRepository
) {

    fun findTransactionByAccount(account: String): List<AccountTransaction> =
            accountTransactionRepository.findByAccount(account)

    fun createTransactions(transactions: List<AccountTransaction>) {
        for (transaction in transactions) {
            accountTransactionRepository.save(transaction)
        }
    }

}