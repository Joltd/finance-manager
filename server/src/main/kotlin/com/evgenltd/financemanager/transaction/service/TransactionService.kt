package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.record.Usage
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import com.evgenltd.financemanager.transaction.repository.ExpenseTransactionRepository
import com.evgenltd.financemanager.transaction.repository.IncomeTransactionRepository
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.stereotype.Service

@Service
class TransactionService(
        private val transactionRepository: TransactionRepository,
        private val accountTransactionRepository: AccountTransactionRepository,
        private val expenseTransactionRepository: ExpenseTransactionRepository,
        private val incomeTransactionRepository: IncomeTransactionRepository
) {

    fun save(transaction: Transaction) = transactionRepository.save(transaction)

    fun deleteByDocument(document: String) = transactionRepository.deleteByDocument(document)

    fun usageByAccount(account: String): Usage = accountTransactionRepository.findByAccount(account)
            .size
            .let { Usage(it.toString()) }

    fun usageByExpenseCategory(expenseCategory: String): Usage = expenseTransactionRepository.findByExpenseCategory(expenseCategory)
            .size
            .let { Usage(it.toString()) }

    fun usageByIncomeCategory(incomeCategory: String): Usage = incomeTransactionRepository.findByIncomeCategory(incomeCategory)
            .size
            .let { Usage(it.toString()) }

}