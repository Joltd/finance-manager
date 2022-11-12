package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.repository.DocumentIncomeRepository
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.IncomeCategoryRepository
import com.evgenltd.financemanager.reference.repository.name
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentIncomeService(
        private val documentIncomeRepository: DocumentIncomeRepository,
        private val transactionService: TransactionService,
        private val accountRepository: AccountRepository,
        private val incomeCategoryRepository: IncomeCategoryRepository
) : DocumentTypedService<DocumentIncome, DocumentIncomeRecord> {

    override fun hash(record: DocumentIncomeRecord): String =
            "${record.date}-${record.account}-${record.amount}-${record.incomeCategory}"

    override fun update(entity: DocumentIncome) {
        documentIncomeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        AccountTransaction(null, entity.date, Direction.IN, entity.amount, entity.id!!, entity.account)
                .also { transactionService.save(it) }
        IncomeTransaction(null, entity.date, Direction.OUT, entity.amount, entity.id!!, entity.incomeCategory)
                .also { transactionService.save(it) }
    }

    override fun toRecord(entity: DocumentIncome): DocumentIncomeRecord = DocumentIncomeRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            amount = entity.amount,
            account = entity.account,
            accountName = accountRepository.name(entity.account),
            incomeCategory = entity.incomeCategory,
            incomeCategoryName = incomeCategoryRepository.name(entity.incomeCategory)
    )

    override fun toEntity(record: DocumentIncomeRecord): DocumentIncome = DocumentIncome(
            id = record.id,
            date = record.date,
            description = record.description,
            amount = record.amount,
            account = record.account,
            incomeCategory = record.incomeCategory
    )

}