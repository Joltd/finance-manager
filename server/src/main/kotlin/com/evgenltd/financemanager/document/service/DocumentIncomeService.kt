package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.repository.DocumentExpenseRepository
import com.evgenltd.financemanager.document.repository.DocumentIncomeRepository
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentIncomeService(
        private val documentIncomeRepository: DocumentIncomeRepository,
        private val transactionService: TransactionService
) {

    fun update(record: DocumentIncomeRecord) {
        val entity = record.toEntity()
        documentIncomeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        AccountTransaction(null, entity.date, Direction.OUT, entity.amount, entity.id!!, entity.account)
                .also { transactionService.save(it) }
        IncomeTransaction(null, entity.date, Direction.IN, entity.amount, entity.id!!, entity.incomeCategory)
                .also { transactionService.save(it) }
    }

}