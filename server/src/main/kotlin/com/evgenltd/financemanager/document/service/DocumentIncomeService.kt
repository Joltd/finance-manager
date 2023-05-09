package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.util.abs
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.repository.DocumentIncomeRepository
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DocumentIncomeService(
    private val documentIncomeRepository: DocumentIncomeRepository,
    private val accountService: AccountService,
    private val incomeCategoryService: IncomeCategoryService,
    private val transactionService: TransactionService
) : DocumentTypedService<DocumentIncome, DocumentIncomeRecord> {

    @Transactional
    override fun update(entity: DocumentIncome) {
        documentIncomeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        if (entity.amount.value > 0) {
            transactionService.flow(Direction.IN, entity.date, entity.amount, entity.id!!, entity.account, entity.incomeCategory)
        } else {
            transactionService.flow(Direction.OUT, entity.date, entity.amount.abs(), entity.id!!, entity.account, entity.incomeCategory)
        }
    }

    override fun toRecord(entity: DocumentIncome): DocumentIncomeRecord = DocumentIncomeRecord(
        id = entity.id,
        date = entity.date,
        description = entity.description,
        amount = entity.amount,
        account = entity.account,
        accountName = accountService.name(entity.account),
        incomeCategory = entity.incomeCategory,
        incomeCategoryName = incomeCategoryService.name(entity.incomeCategory)
    )

    override fun toEntity(record: DocumentIncomeRecord): DocumentIncome = DocumentIncome(
        id = record.id,
        date = record.date,
        description = record.description,
        amount = record.amount,
        account = accountService.findOrCreate(record.account, record.accountName).id!!,
        incomeCategory = incomeCategoryService.findOrCreate(record.incomeCategory, record.incomeCategoryName).id!!
    )

}