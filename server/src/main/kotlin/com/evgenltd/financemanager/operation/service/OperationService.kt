package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SkipLogging
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
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*

@Service
@SkipLogging
class OperationService(
    private val entityManager: EntityManager,
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
        val old = record.id
            ?.let { operationRepository.findByIdOrNull(it) }
            ?.also { entityManager.detach(it) }
        val new = record.id
            ?.let { operationRepository.findByIdOrNull(it) }
            .let { operationConverter.fillEntity(it, record) }
            .let { operationRepository.save(it) }

        notifyChanged(old, new)

        return operationConverter.toRecord(new)
    }

    @Transactional
    fun delete(id: UUID) {
        val operation = operationRepository.find(id)
        operationRepository.delete(operation)
        entityManager.detach(operation)
        notifyChanged(operation, null)
    }

    @Transactional
    fun delete(ids: List<UUID>) {
        operationRepository.findAllById(ids)
            .onEach { operationRepository.delete(it) }
            .onEach { entityManager.detach(it) }
            .map { OperationEventEntry(old = it) }
            .let { OperationEvent(it) }
            .let { notifyChanged(it)}
    }

    private fun notifyChanged(old: Operation?, new: Operation?) {
        if (!isTransactionDataChanged(old, new)) {
            return
        }

        val entry = OperationEventEntry(
            old?.also { entityManager.detach(it) },
            new?.also { entityManager.detach(it) },
        )
        notifyChanged(OperationEvent(listOf(entry)))
    }

    private fun notifyChanged(event: OperationEvent) {
        publisher.publishEvent(event)
        operationEventService.operation()
    }

}