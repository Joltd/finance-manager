package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import org.springframework.context.event.EventListener
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val operationRepository: OperationRepository,
) {

    @EventListener
    fun operationChanged(event: OperationEvent) {
        for (entry in event.entries) {
            entry.old
                ?.let { transactionRepository.deleteByOperationId(it.id!!) }

            val operation = entry.new
                ?.let { operationRepository.find(it.id!!) }
                ?: continue

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