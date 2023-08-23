package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.gte
import com.evgenltd.financemanager.common.repository.lt
import com.evgenltd.financemanager.common.repository.findAll
import com.evgenltd.financemanager.common.repository.inList
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationPage
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.reference.repository.AccountRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OperationService(
    private val operationRepository: OperationRepository,
    private val accountRepository: AccountRepository,
    private val transactionService: TransactionService
) {

    fun list(filter: OperationFilter): OperationPage =
        operationRepository.findAll(PageRequest.of(filter.page, filter.size)) {
            (Operation.Companion::date gte filter.dateFrom) and
            (Operation.Companion::date lt filter.dateTo) and
            (
                (Operation.Companion::accountFromId inList filter.accounts) or
                (Operation.Companion::accountToId inList filter.accounts)
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
        accountFromId = accountFrom.id!!,
        accountFromName = accountFrom.name,
        amountTo = amountTo,
        accountToId = accountTo.id!!,
        accountToName = accountTo.name,
    )

    private fun OperationRecord.toEntity(): Operation = Operation(
        id = id,
        date = date,
        amountFrom = amountFrom,
        accountFrom = accountRepository.find(accountFromId),
        amountTo = amountTo,
        accountTo = accountRepository.find(accountToId)
    )

}