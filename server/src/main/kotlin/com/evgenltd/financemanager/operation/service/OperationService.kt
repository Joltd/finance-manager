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
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationGroupRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*

@Service
@SkipLogging
class OperationService(
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val transactionService: TransactionService,
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