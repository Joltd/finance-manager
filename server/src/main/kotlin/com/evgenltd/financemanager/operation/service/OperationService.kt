package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.emptyCondition
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.common.repository.gte
import com.evgenltd.financemanager.common.repository.lt
import com.evgenltd.financemanager.common.repository.notEq
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationPage
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.record.OperationType
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.reference.repository.AccountRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.*

@Service
class OperationService(
    private val operationRepository: OperationRepository,
    private val accountRepository: AccountRepository,
    private val transactionService: TransactionService
) {

    fun list(filter: OperationFilter): OperationPage =
        operationRepository.findAllByCondition(PageRequest.of(filter.page, filter.size)) {
            (Operation.Companion::date gte filter.dateFrom) and
            (Operation.Companion::date lt filter.dateTo) and
            when (filter.type) {
                OperationType.EXPENSE -> (Operation.Companion::accountFromType eq AccountType.EXPENSE)
                OperationType.INCOME -> (Operation.Companion::accountToType eq AccountType.INCOME)
                OperationType.EXCHANGE -> (Operation.Companion::accountFromType notEq AccountType.EXPENSE) and (Operation.Companion::accountToType notEq AccountType.INCOME)
                null -> emptyCondition()
            } and
            (
                (Operation.Companion::accountFromId eq filter.account) or
                (Operation.Companion::accountToId eq filter.account)
            ) and
            (
                (Operation.Companion::accountFromId eq filter.category) or
                (Operation.Companion::accountToId eq filter.category)
            ) and
            (
                (Operation.Companion::currencyFrom eq filter.currency) or
                (Operation.Companion::currencyTo eq filter.currency)
            )
        }.let { page ->
            OperationPage(
                total = page.totalElements,
                page = filter.page,
                size = filter.size,
                operations = page.content.map { it.toRecord() }
            )
        }

    fun byId(id: UUID): OperationRecord = operationRepository.find(id).toRecord()

    @Transactional
    fun update(record: OperationRecord) {
        val entity = record.toEntity()
        operationRepository.save(entity)
        transactionService.refillByOperation(entity)
    }

    @Transactional
    fun delete(id: UUID) {
        operationRepository.deleteById(id)
        transactionService.deleteByOperation(id)
    }

    private fun Operation.toRecord(): OperationRecord = OperationRecord(
        id = id,
        date = date,
        amountFrom = amountFrom,
        accountFrom = accountFrom.toRecord(),
        amountTo = amountTo,
        accountTo = accountTo.toRecord(),
        description = description
    )

    private fun OperationRecord.toEntity(): Operation = Operation(
        id = id,
        date = date,
        amountFrom = amountFrom,
        accountFrom = accountRepository.find(accountFrom.id!!),
        amountTo = amountTo,
        accountTo = accountRepository.find(accountTo.id!!),
        description = description
    )

}