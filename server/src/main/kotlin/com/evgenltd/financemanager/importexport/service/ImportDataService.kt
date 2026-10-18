package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.SeekDirection
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataDayRecord
import com.evgenltd.financemanager.importexport.record.ImportDataEntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.operation.service.byAccount
import com.evgenltd.financemanager.operation.service.byCurrency
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@SkipLogging
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val balanceRepository: BalanceRepository,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataDayRepository: ImportDataDayRepository,
    private val operationRepository: OperationRepository,
    private val operationService: OperationService,
) {

    fun list(): List<Reference> = importDataRepository.findAll().map { importDataConverter.toReference(it) }

    @Transactional
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
        val dateRange = importDataDayRepository.findImportDataDateRange(importData)
        val balances = balanceRepository.findByAccount(importData.account).associate { it.amount.currency to it.amount }
        return importDataConverter.toRecord(importData, dateRange, balances)
    }

    @Transactional
    fun entryList(id: UUID, filter: ImportDataEntryFilter): List<ImportDataDayRecord> {
        val importData = importDataRepository.find(id)
        var dates = filter.pointers
        if (dates == null && filter.pointer != null && filter.direction != null) {
            dates = findNearDates(filter.pointer, filter.direction, importData)
        }
        if (dates == null) {
            throw badRequestException("Either pointers or pointer with direction should be provided")
        }
        if (dates.isEmpty()) {
            return emptyList()
        }

        val days = ((ImportDataDay::importData eq importData) and (ImportDataDay::date contains dates))
            .let { importDataDayRepository.findAll(it) }
        val daysByDate = days.mapNotNull { day -> day.date?.let { it to day } }.toMap()
        val linkedOperationIds = days.asSequence()
            .flatMap { it.entries.asSequence() }
            .mapNotNull { it.operation?.id }
            .toList()

        val freeOperations = (
            (Operation::date contains dates) and
                byAccount(importData.account) and
                byCurrency(importData.currency) and
                (Operation::id containsNot linkedOperationIds)
            )
            .let { operationRepository.findAll(it) }
            .groupBy { it.date }

        return dates.distinct().map { date ->
            val day = daysByDate[date]
            val entries = day?.entries.orEmpty()
                .filter { it.date != null }
                .sortedBy { it.id }
                .map { importDataConverter.toRecord(it) }
            val operations = freeOperations[date].orEmpty()
                .sortedBy { it.id }
                .map { importDataConverter.toRecord(it) }
            ImportDataDayRecord(
                date = date,
                valid = day?.valid ?: false,
                totals = day?.totals.orEmpty().map { importDataConverter.toRecord(it) },
                entries = entries + operations,
            )
        }.sortedByDescending { it.date }
    }

    private fun findNearDates(
        pointer: java.time.LocalDate,
        direction: SeekDirection,
        importData: ImportData,
    ): List<java.time.LocalDate> {
        val daySpecification = (ImportDataDay::importData eq importData) and when (direction) {
            SeekDirection.FORWARD -> ImportDataDay::date gt pointer
            SeekDirection.BACKWARD -> ImportDataDay::date lt pointer
        }
        val sortDirection = when (direction) {
            SeekDirection.FORWARD -> Sort.Direction.ASC
            SeekDirection.BACKWARD -> Sort.Direction.DESC
        }
        val page = PageRequest.of(0, NEAREST_DATE_LIMIT, sortDirection, "date")
        val importDates = importDataDayRepository.findAll(daySpecification, page)
            .mapNotNull { it.date }

        val operationSpecification = byAccount(importData.account) and byCurrency(importData.currency)
        val operationDates = operationService.findNearDates(
            pointer,
            direction,
            operationSpecification,
            NEAREST_DATE_LIMIT,
        )

        return (importDates + operationDates)
            .distinct()
            .let { candidates ->
                when (direction) {
                    SeekDirection.FORWARD -> candidates.sorted()
                    SeekDirection.BACKWARD -> candidates.sortedDescending()
                }
            }
            .take(NEAREST_DATE_LIMIT)
    }

    fun save(request: ImportDataCreateRequest): ImportData = ImportData(
        account = accountRepository.find(request.account),
        currency = request.currency,
    ).let { importDataRepository.save(it) }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

    private companion object {
        const val NEAREST_DATE_LIMIT = 5
    }
}
