package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.ExpenseCategoryRepository
import com.evgenltd.financemanager.reference.repository.name
import com.evgenltd.financemanager.reference.repository.nameOrNull
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExchangeTransaction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentExchangeService(
        private val documentExchangeRepository: DocumentExchangeRepository,
        private val transactionService: TransactionService,
        private val accountRepository: AccountRepository,
        private val expenseCategoryRepository: ExpenseCategoryRepository,
        private val exchangeRateService: ExchangeRateService
) : DocumentTypedService<DocumentExchange, DocumentExchangeRecord> {

    override fun hash(record: DocumentExchangeRecord, account: String): String = when (account) {
        record.accountFrom -> "${record.date}-${record.accountTo}-${record.amountTo}"
        record.accountTo -> "${record.date}-${record.accountFrom}-${record.amountFrom}"
        else -> "${record.date}-${record.accountFrom}-${record.amountFrom}-${record.accountTo}-${record.amountTo}"
    }

    override fun update(record: DocumentExchangeRecord) {
        val entity = toEntity(record)
        documentExchangeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)

        ExchangeTransaction(null, entity.date, Direction.IN, entity.amountFrom, entity.id!!).also { transactionService.save(it) }
        AccountTransaction(null, entity.date, Direction.OUT, entity.amountFrom, entity.id!!, entity.accountFrom).also { transactionService.save(it) }

        val commissionAmount = entity.commissionAmount
        val commissionExpenseCategory = entity.commissionExpenseCategory
        if (commissionAmount != null && commissionExpenseCategory != null) {
            ExpenseTransaction(null, entity.date, Direction.IN, commissionAmount, entity.id!!, commissionExpenseCategory).also { transactionService.save(it) }
            AccountTransaction(null, entity.date, Direction.OUT, commissionAmount, entity.id!!, entity.accountFrom).also { transactionService.save(it) }
        }

        AccountTransaction(null, entity.date, Direction.IN, entity.amountTo, entity.id!!, entity.accountTo).also { transactionService.save(it) }
        ExchangeTransaction(null, entity.date, Direction.OUT, entity.amountTo, entity.id!!).also { transactionService.save(it) }

        exchangeRateService.saveRate(entity.date, entity.amountFrom, entity.amountTo)
    }

    override fun toRecord(entity: DocumentExchange): DocumentExchangeRecord = DocumentExchangeRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            accountFrom = entity.accountFrom,
            accountFromName = accountRepository.name(entity.accountFrom),
            amountFrom = entity.amountFrom,
            accountTo = entity.accountTo,
            accountToName = accountRepository.name(entity.accountTo),
            amountTo = entity.amountTo,
            commissionExpenseCategory = entity.commissionExpenseCategory,
            commissionExpenseCategoryName = expenseCategoryRepository.nameOrNull(entity.commissionExpenseCategory),
            commissionAmount = entity.commissionAmount
    )

    override fun toEntity(record: DocumentExchangeRecord): DocumentExchange = DocumentExchange(
            id = record.id,
            date = record.date,
            description = record.description,
            accountFrom = record.accountFrom,
            amountFrom = record.amountFrom,
            accountTo = record.accountTo,
            amountTo = record.amountTo,
            commissionExpenseCategory = record.commissionExpenseCategory,
            commissionAmount = record.commissionAmount
    )
}