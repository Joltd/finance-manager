package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
) {

    @Transactional
    fun refillByOperation(operation: Operation) {
        val operationId = operation.id ?: return
        transactionRepository.deleteByOperationId(operationId)
        transactionRepository.save(Transaction(
            type = TransactionType.OUT,
            date = operation.date,
            amount = operation.amountFrom,
            account = operation.accountFrom,
            operation = operation
        ))
        transactionRepository.save(Transaction(
            type = TransactionType.IN,
            date = operation.date,
            amount = operation.amountTo,
            account = operation.accountTo,
            operation = operation
        ))
    }

    @Transactional
    fun deleteByOperation(operationId: UUID?) {
        if (operationId == null) {
            return
        }
        transactionRepository.deleteByOperationId(operationId)
    }
}