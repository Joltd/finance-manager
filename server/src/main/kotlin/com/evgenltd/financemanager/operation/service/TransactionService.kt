package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import org.springframework.context.event.EventListener
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
) {

    @EventListener
    fun operationChanged(event: OperationEvent) {
        for (entry in event.entries) {
            val operation = entry.new ?: continue

            transactionRepository.deleteByOperation(operation)

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
    }

}