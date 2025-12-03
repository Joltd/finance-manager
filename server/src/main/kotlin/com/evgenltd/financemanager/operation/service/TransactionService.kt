package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@SkipLogging
class TransactionService(
    private val transactionRepository: TransactionRepository,
) {

    @Transactional
    fun save(operation: Operation) {
        delete(operation.id!!)

        Transaction(
            type = TransactionType.OUT,
            date = operation.date,
            amount = operation.amountFrom,
            account = operation.accountFrom,
            operation = operation
        ).let { transactionRepository.save(it) }
        Transaction(
            type = TransactionType.IN,
            date = operation.date,
            amount = operation.amountTo,
            account = operation.accountTo,
            operation = operation
        ).let { transactionRepository.save(it) }
    }

    fun delete(operationId: UUID) {
        transactionRepository.deleteByOperationId(operationId)
    }

}