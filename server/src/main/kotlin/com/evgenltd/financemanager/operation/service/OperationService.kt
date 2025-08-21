package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.account
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.currency
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.common.service.validWeek
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.record.OperationEventEntry
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*

@Service
class OperationService(
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val operationEventService: OperationEventService,
    private val publisher: ApplicationEventPublisher,
) {

    fun list(filter: OperationFilter): List<OperationGroupRecord> = (
        (Operation::date between filter.date.validWeek()) and
            (Operation::type eq filter.type) and
            ((Operation::accountFrom account filter.account) or (Operation::accountTo account filter.account)) and
            ((Operation::accountFrom account filter.category) or (Operation::accountTo account filter.category)) and
            ((Operation::amountFrom currency filter.currency) or (Operation::amountTo currency filter.currency))
    ).let { operationRepository.findAll(it) }
        .groupBy { it.date }
        .mapValues { (_, operations) ->
            operations.map { operation -> operationConverter.toRecord(operation)}
                .sortedWith(compareBy(
                    { it.amountFrom.currency },
                    { it.amountFrom.value },
                ))
        }
        .map { (date, operations) -> OperationGroupRecord(date, operations) }
        .sortedBy { it.date }

    fun listLast(): List<OperationRecord> = operationRepository.findAllByOrderByDateDesc(Pageable.ofSize(5))
        .map { operationConverter.toRecord(it) }

    fun byId(id: UUID): OperationRecord = operationRepository.find(id).let { operationConverter.toRecord(it) }

    @Transactional
    fun update(record: OperationRecord): OperationRecord {
        val existed = record.id?.let { operationRepository.findByIdOrNull(it) }
        val entity = operationConverter.toEntity(record, existed)
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
        operationEventService.operation()
    }

}