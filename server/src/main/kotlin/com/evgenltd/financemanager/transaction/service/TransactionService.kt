package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.stereotype.Service

@Service
class TransactionService(
        private val transactionRepository: TransactionRepository
) {

    fun save(transaction: Transaction) = transactionRepository.save(transaction)

    fun deleteByDocument(document: String) = transactionRepository.deleteByDocument(document)

}