package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.SeekDirection
import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
@SkipLogging
class OperationService(
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val transactionService: TransactionService,
    private val entityManager: EntityManager,
) {

    fun list(filter: OperationFilter): List<OperationGroupRecord> {
        val pointer = filter.pointer ?: return emptyList()
        val direction = filter.direction ?: return emptyList()

        val baseSpecification = (
//            (Operation::date between filter.date) and
                (Operation::type eq filter.type) and
                byAccount(filter.account) and
                byAccount(filter.category) and
                byCurrency(filter.currency) and
                ((Operation::amountFrom amountBetween filter.amount) or (Operation::amountTo amountBetween filter.amount))
        )

        val dates = findNearDates(pointer, direction, baseSpecification)

        if (dates.isEmpty()) {
            return emptyList()
        }

        val specification = (Operation::date contains dates) and baseSpecification

        return operationRepository.findAll(specification)
            .groupBy { it.date }
            .mapValues { (_, operations) ->
                operations.map { operationConverter.toRecord(it) }
                    .sortedWith(compareBy(
                        { it.amountFrom.currency },
                        { it.amountFrom.value },
                    ))
            }
            .map { (date, operations) -> OperationGroupRecord(date, operations) }
            .sortedByDescending { it.date }
    }

    fun findNearDates(
        date: LocalDate,
        direction: SeekDirection,
        baseSpecification: Specification<Operation>,
        limit: Int = NEAREST_DATE_LIMIT
    ): List<LocalDate> {
        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery(LocalDate::class.java)
        val root = query.from(Operation::class.java)

        val datePath = root.get<LocalDate>(Operation::date.name)

        val predicate = (when (direction) {
            SeekDirection.FORWARD  -> Operation::date gt date
            SeekDirection.BACKWARD -> Operation::date lt date
        } and baseSpecification)
            .toPredicate(root, query, cb)

        val order = when (direction) {
            SeekDirection.FORWARD  -> cb.asc(datePath)
            SeekDirection.BACKWARD -> cb.desc(datePath)
        }

        query
            .select(datePath)
            .distinct(true)
            .also { if (predicate != null) it.where(predicate) }
            .orderBy(order)

        return entityManager.createQuery(query)
            .setMaxResults(limit)
            .resultList
    }

    fun byId(id: UUID): OperationRecord = operationRepository.find(id).let { operationConverter.toRecord(it) }

    @Transactional
    fun update(record: OperationRecord): OperationChangeRecord {
        val old = record.id?.let { operationRepository.findByIdOrNull(it) }
            ?.let { operationConverter.toChangeRecord(it) }

        val operation = record.id?.let { operationRepository.findByIdOrNull(it) }
            .let { operationConverter.fillEntity(it, record) }
            .let { operationRepository.save(it) }

        transactionService.save(operation)

        val new = operationConverter.toChangeRecord(operation)

        return OperationChangeRecord(old, new)
    }

    @Transactional
    fun save(operations: List<Operation>): List<OperationChangeRecord> {
        val saved = operationRepository.saveAll(operations)
        saved.onEach { transactionService.save(it) }
        return saved.map {
            OperationChangeRecord(
                old = null,
                new = operationConverter.toChangeRecord(it)
            )
        }
    }

    @Transactional
    fun delete(id: UUID): OperationChangeRecord {
        val operation = operationRepository.find(id)

        transactionService.delete(operation.id!!)
        operationRepository.delete(operation)

        val operationChange = operationConverter.toChangeRecord(operation)

        return OperationChangeRecord(old = operationChange, new = null)
    }

    @Transactional
    fun delete(ids: List<UUID>): List<OperationChangeRecord> {
        val changes = operationRepository.findAllById(ids)
            .map { operationConverter.toChangeRecord(it) }
            .map { OperationChangeRecord(old = it, new = null) }

        for (id in ids) {
            transactionService.delete(id)
            operationRepository.deleteById(id)
        }

        return changes
    }

    private companion object {
        const val NEAREST_DATE_LIMIT = 5
    }

}