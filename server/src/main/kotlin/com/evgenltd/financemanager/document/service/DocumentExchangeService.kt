package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExchangeTransaction
import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentExchangeService(
        private val documentExchangeRepository: DocumentExchangeRepository,
        private val transactionService: TransactionService
) {

    fun update(record: DocumentExchangeRecord) {
        val entity = record.toEntity()
        documentExchangeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)

        ExchangeTransaction(null, entity.date, Direction.IN, entity.amountFrom, entity.id!!).also { transactionService.save(it) }
        AccountTransaction(null, entity.date, Direction.OUT, entity.amountFrom, entity.id!!, entity.accountFrom).also { transactionService.save(it) }

        if (entity.commissionAmount.value != 0L) {
            ExpenseTransaction(null, entity.date, Direction.IN, entity.commissionAmount, entity.id!!, entity.commissionExpenseCategory).also { transactionService.save(it) }
            AccountTransaction(null, entity.date, Direction.OUT, entity.commissionAmount, entity.id!!, entity.accountFrom).also { transactionService.save(it) }
        }

        AccountTransaction(null, entity.date, Direction.IN, entity.amountTo, entity.id!!, entity.accountTo).also { transactionService.save(it) }
        ExchangeTransaction(null, entity.date, Direction.OUT, entity.amountTo, entity.id!!).also { transactionService.save(it) }
    }

    private fun DocumentExchangeRecord.toEntity(): DocumentExchange = DocumentExchange(
            id = id,
            date = date,
            description = description,
            accountFrom = accountFrom,
            amountFrom = amountFrom,
            accountTo = accountTo,
            amountTo = amountTo,
            commissionExpenseCategory = commissionExpenseCategory,
            commissionAmount = commissionAmount
    )
    
}