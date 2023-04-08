package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.repository.DocumentExpenseRepository
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.transaction.event.RebuildGraphEvent
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class DocumentExpenseService(
    private val documentExpenseRepository: DocumentExpenseRepository,
    private val accountService: AccountService,
    private val expenseCategoryService: ExpenseCategoryService,
    private val transactionService: TransactionService
) : DocumentTypedService<DocumentExpense, DocumentExpenseRecord> {

    override fun update(entity: DocumentExpense) {
        documentExpenseRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        transactionService.outflow(entity.date, entity.amount, entity.id!!, entity.account)
    }

    override fun toRecord(entity: DocumentExpense): DocumentExpenseRecord = DocumentExpenseRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            amount = entity.amount,
            account = entity.account,
            accountName = accountService.name(entity.account),
            expenseCategory = entity.expenseCategory,
            expenseCategoryName = expenseCategoryService.name(entity.expenseCategory)
    )

    override fun toEntity(record: DocumentExpenseRecord): DocumentExpense = DocumentExpense(
            id = record.id,
            date = record.date,
            description = record.description,
            amount = record.amount,
            account = accountService.findOrCreate(record.account, record.accountName).id!!,
            expenseCategory = expenseCategoryService.findOrCreate(record.expenseCategory, record.expenseCategoryName).id!!
    )
}