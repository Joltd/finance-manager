package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.repository.DocumentExpenseRepository
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import com.evgenltd.financemanager.reference.repository.name
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentExpenseService(
        private val documentExpenseRepository: DocumentExpenseRepository,
        private val transactionService: TransactionService,
        private val accountRepository: AccountRepository,
        private val expenseCategoryRepository: ExpenseCategoryRepository
) : DocumentTypedService<DocumentExpense, DocumentExpenseRecord> {

    override fun hash(record: DocumentExpenseRecord, account: String): String = if (record.account == account) {
        "${record.date}-${record.amount}-${record.expenseCategory}"
    } else {
        "${record.date}-${record.account}-${record.amount}-${record.expenseCategory}"
    }

    override fun update(record: DocumentExpenseRecord) {
        val entity = toEntity(record)
        documentExpenseRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        AccountTransaction(null, entity.date, Direction.OUT, entity.amount, entity.id!!, entity.account)
                .also { transactionService.save(it) }
        ExpenseTransaction(null, entity.date, Direction.IN, entity.amount, entity.id!!, entity.expenseCategory)
                .also { transactionService.save(it) }
    }

    override fun toRecord(entity: DocumentExpense): DocumentExpenseRecord = DocumentExpenseRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            amount = entity.amount,
            account = entity.account,
            accountName = accountRepository.name(entity.account),
            expenseCategory = entity.expenseCategory,
            expenseCategoryName = expenseCategoryRepository.name(entity.expenseCategory)
    )

    override fun toEntity(record: DocumentExpenseRecord): DocumentExpense = DocumentExpense(
            id = record.id,
            date = record.date,
            description = record.description,
            amount = record.amount,
            account = record.account,
            expenseCategory = record.expenseCategory
    )
}