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
import com.evgenltd.financemanager.importexport.entity.SuggestedOperation
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationPage
import com.evgenltd.financemanager.operation.record.OperationRecord
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
        operationRepository.findAllByCondition(filter.page, filter.size) {
            (Operation.Companion::date gte filter.dateFrom) and
            (Operation.Companion::date lt filter.dateTo) and
            (Operation.Companion::type eq filter.type) and
            (
                filter.account?.let {
                    ((Operation.Companion::accountFromType eq AccountType.ACCOUNT) and (Operation.Companion::accountFromId eq it.id)) or
                    ((Operation.Companion::accountToType eq AccountType.ACCOUNT) and (Operation.Companion::accountToId eq it.id))
                } ?: emptyCondition()
            ) and
            (
                filter.category?.let {
                    ((Operation.Companion::accountFromType notEq AccountType.ACCOUNT) and (Operation.Companion::accountFromId eq it.id)) or
                    ((Operation.Companion::accountToType notEq AccountType.ACCOUNT) and (Operation.Companion::accountToId eq it.id))
                } ?: emptyCondition()
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

    fun findSimilar(operation: SuggestedOperation): List<Operation> =
        operationRepository.findByDateAndAccountFromIdAndAccountToId(operation.date, operation.accountFrom, operation.accountTo)
            .filter { it.amountFrom.isSimilar(operation.amountFrom) && it.amountTo.isSimilar(operation.amountTo) }

    private fun Operation.toRecord(): OperationRecord = OperationRecord(
        id = id,
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom.toRecord(),
        amountTo = amountTo,
        accountTo = accountTo.toRecord(),
        description = description
    )

    private fun OperationRecord.toEntity(): Operation = Operation(
        id = id,
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountRepository.find(accountFrom.id!!),
        amountTo = amountTo,
        accountTo = accountRepository.find(accountTo.id!!),
        description = description
    )

}