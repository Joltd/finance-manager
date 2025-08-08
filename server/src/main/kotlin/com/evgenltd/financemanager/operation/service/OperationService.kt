package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.record.OperationEventEntry
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationPage
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
class OperationService(
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val publisher: ApplicationEventPublisher,
) {

    fun list(filter: OperationFilter): OperationPage = pagedList(filter, Sort.by(Sort.Direction.DESC, Operation::date.name))
        .let { page ->
            OperationPage(
                total = page.totalElements,
                page = filter.page,
                size = filter.size,
                operations = page.content
                    .sortedByDescending { it.date }
                    .map { operationConverter.toRecord(it) }
            )
        }

    fun pagedList(filter: OperationFilter, sort: Sort = Sort.unsorted()): Page<Operation> =
        operationRepository.findAll(Pageable.unpaged())
//        operationRepository.findAllByCondition(filter.page, filter.size, sort) {
//            (Operation.Companion::date gte filter.dateFrom) and
//            (Operation.Companion::date lt filter.dateTo) and
//            (Operation.Companion::type eq filter.type) and
//            (
//                filter.account?.let {
//                    ((Operation.Companion::accountFromType eq AccountType.ACCOUNT) and (Operation.Companion::accountFromId eq it.id)) or
//                    ((Operation.Companion::accountToType eq AccountType.ACCOUNT) and (Operation.Companion::accountToId eq it.id))
//                } ?: emptyCondition()
//            ) and
//            (
//                filter.category?.let {
//                    ((Operation.Companion::accountFromType notEq AccountType.ACCOUNT) and (Operation.Companion::accountFromId eq it.id)) or
//                    ((Operation.Companion::accountToType notEq AccountType.ACCOUNT) and (Operation.Companion::accountToId eq it.id))
//                } ?: emptyCondition()
//            ) and
//            (
//                (Operation.Companion::currencyFrom eq filter.currency) or
//                (Operation.Companion::currencyTo eq filter.currency)
//            )
//        }

    fun byId(id: UUID): OperationRecord = operationRepository.find(id).let { operationConverter.toRecord(it) }

    @Transactional
    fun update(record: OperationRecord): OperationRecord {
        val existed = record.id?.let { operationRepository.findByIdOrNull(it) }
        val entity = operationConverter.toEntity(record)
        val saved = operationRepository.save(entity)
        notifyChanged(existed, saved)
        return operationConverter.toRecord(saved)
    }

    @Transactional
    fun delete(id: UUID) {
        val operation = operationRepository.find(id)
        operationRepository.delete(operation)
        notifyChanged(operation, null)
    }

    @Transactional
    fun delete(ids: List<UUID>) {
        operationRepository.findAllById(ids)
            .onEach { operationRepository.delete(it) }
            .map { OperationEventEntry(old = operationConverter.copy(it)) }
            .let { OperationEvent(it) }
            .let { notifyChanged(it)}
    }

    private fun notifyChanged(old: Operation?, new: Operation?) {
        val entry = OperationEventEntry(
            old?.let { operationConverter.copy(it) },
            new?.let { operationConverter.copy(it) },
        )
        notifyChanged(OperationEvent(listOf(entry)))
    }

    private fun notifyChanged(event: OperationEvent) {
        publisher.publishEvent(event)
    }

    fun findSimilar(operation: OperationRecord): List<Operation> = findSimilar(
        date = operation.date,
        accountFromId = operation.accountFrom.id,
        amountFrom = operation.amountFrom,
        accountToId = operation.accountTo.id,
        amountTo = operation.amountTo
    )

    fun findSimilar(
        date: LocalDate,
        accountFromId: UUID? = null,
        amountFrom: Amount,
        accountToId: UUID? = null,
        amountTo: Amount
    ): List<Operation> {
        val result = LinkedList<List<Operation>>()

        var operations = operationRepository.findByDate(date)
        result.push(operations)

        operations = operations.filter { it.amountFrom.isSimilar(amountFrom) && it.amountTo.isSimilar(amountTo) }
        result.push(operations)

        operations = operations.filter { it.amountFrom == amountFrom && it.amountTo == amountTo }
        result.push(operations)

        operations = operations.filter { it.accountFrom.id == accountFromId && it.accountTo.id == accountToId }
        result.push(operations)

        while (result.isNotEmpty()) {
            val possiblyOperation = result.poll()
            if (possiblyOperation.isNotEmpty()) {
                return possiblyOperation
            }
        }

        return emptyList()
    }

}