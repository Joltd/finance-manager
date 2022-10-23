package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.repository.DocumentExpenseRepository
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentExpenseService(
        private val documentExpenseRepository: DocumentExpenseRepository,
        private val transactionService: TransactionService
) {

    fun update(record: DocumentExpenseRecord) {
        val entity = record.toEntity()
        documentExpenseRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        AccountTransaction(null, entity.date, Direction.OUT, entity.amount, entity.id!!, entity.account)
                .also { transactionService.save(it) }
        ExpenseTransaction(null, entity.date, Direction.IN, entity.amount, entity.id!!, entity.expenseCategory)
                .also { transactionService.save(it) }
    }

    fun toRecord(entity: DocumentExpense): DocumentExpenseRecord = DocumentExpenseRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            amount = entity.amount,
            account = entity.account,
            expenseCategory = entity.expenseCategory
    )

    private fun DocumentExpenseRecord.toEntity(): DocumentExpense = DocumentExpense(
            id = id,
            date = date,
            description = description,
            amount = amount,
            account = account,
            expenseCategory = expenseCategory
    )

}