package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.DateDirection
import com.evgenltd.financemanager.common.repository.account
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.currency
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.gte
import com.evgenltd.financemanager.common.repository.lt
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.data.domain.Pageable
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
        val baseSpecification = (
            (Operation::date between filter.dateRange) and
                (Operation::type eq filter.type) and
                ((Operation::accountFrom account filter.account) or (Operation::accountTo account filter.account)) and
                ((Operation::accountFrom account filter.category) or (Operation::accountTo account filter.category)) and
                ((Operation::amountFrom currency filter.currency) or (Operation::amountTo currency filter.currency))
        )

        val dates = findDistinctDates(filter.date, filter.direction, baseSpecification)

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

    private fun findDistinctDates(date: LocalDate, direction: DateDirection, baseSpecification: Specification<Operation>): List<LocalDate> {
        val cb = entityManager.criteriaBuilder
        val query = cb.createQuery(LocalDate::class.java)
        val root = query.from(Operation::class.java)

        val datePath = root.get<LocalDate>(Operation::date.name)

        val predicate = (when (direction) {
            DateDirection.BACKWARD -> Operation::date lt date
            DateDirection.FORWARD  -> Operation::date gte date
        } and baseSpecification)
            .toPredicate(root, query, cb)

        val order = when (direction) {
            DateDirection.BACKWARD -> cb.desc(datePath)
            DateDirection.FORWARD  -> cb.asc(datePath)
        }

        query
            .select(datePath)
            .distinct(true)
            .also { if (predicate != null) it.where(predicate) }
            .orderBy(order)

        return entityManager.createQuery(query)
            .setMaxResults(5)
            .resultList
    }

    fun listLast(): List<OperationRecord> = operationRepository.findAllByOrderByDateDesc(Pageable.ofSize(5))
        .map { operationConverter.toRecord(it) }

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

}