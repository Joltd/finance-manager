package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.record.SeekDirection
import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.record.EntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataDayRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.operation.service.byAccount
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
@SkipLogging
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val balanceRepository: BalanceRepository,
    private val operationRepository: OperationRepository,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataDayRepository: ImportDataDayRepository,
    private val operationService: OperationService,
) {

    @SkipLogging
    fun list(): List<Reference> = importDataRepository.findAll()
        .map { importDataConverter.toReference(it) }

    @SkipLogging
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
        val dateRange = importDataDayRepository.findImportDataDateRange(importData)
        val balances = balanceRepository.findByAccount(importData.account)
            .associate { it.amount.currency to it.amount }
        return importDataConverter.toRecord(importData, dateRange, balances)
    }

    @SkipLogging
    fun entryList(id: UUID, request: EntryFilter): List<ImportDataDayRecord> {
        val importData = importDataRepository.find(id)

        var dates = request.pointers
        if (dates == null && request.pointer != null && request.direction != null) {
            dates = findNearDates(request.pointer, request.direction, importData)
        }

        if (dates == null) {
            throw badRequestException("Either pointers or pointer with direction should be provided")
        }

        if (dates.isEmpty()) {
            return emptyList()
        }

        val days = ((ImportDataDay::importData eq importData) and
                (ImportDataDay::date contains dates))
            .let { importDataDayRepository.findAll(it) }

        val linkedOperations = days.flatMap { it.entries }
            .mapNotNull { it.operation }
            .mapNotNull { it.id }

        val actualDates = days.map { it.date }

        val freeOperations = ((Operation::date contains actualDates) and
                byAccount(importData.account) and
                (Operation::id containsNot linkedOperations))
            .let { operationRepository.findAll(it) }
            .groupBy { it.date }

        return days.map { day ->
            val operations = freeOperations[day.date]
                ?.map { importDataConverter.toRecord(importData, it) }
                ?: emptyList()
            val entries = day.entries
                .map { importDataConverter.toRecord(importData, it) }
            ImportDataDayRecord(
                date = day.date,
                valid = day.valid,
                totals = day.totals.map { importDataConverter.toRecord(it) },
                entries = entries + operations,
            )
        }.sortedByDescending { it.date }
    }

    private fun findNearDates(
        pointer: LocalDate,
        direction: SeekDirection,
        importData: ImportData,
    ): List<LocalDate> {
        val specification = (ImportDataDay::importData eq importData) and
                when (direction) {
                    SeekDirection.FORWARD -> ImportDataDay::date gt pointer
                    SeekDirection.BACKWARD -> ImportDataDay::date lt pointer
                }

        val sortDirection = when (direction) {
            SeekDirection.FORWARD -> Sort.Direction.ASC
            SeekDirection.BACKWARD -> Sort.Direction.DESC
        }
        val page = PageRequest.of(1, NEAREST_DATE_LIMIT, sortDirection, "date")
        val importDataDates = importDataDayRepository.findAll(specification, page)
            .map { it.date }

        val operationsDates = operationService.findNearDates(pointer, direction, byAccount(importData.account), NEAREST_DATE_LIMIT)

        return (importDataDates + operationsDates)
            .asSequence()
            .distinct()
            .let {
                when (direction) {
                    SeekDirection.FORWARD -> it.sorted()
                    SeekDirection.BACKWARD -> it.sortedDescending()
                }
            }
            .take(NEAREST_DATE_LIMIT)
            .toList()
    }

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account, currency = request.currency, progress = true)
        return importDataRepository.save(importData)
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

    private companion object {
        const val NEAREST_DATE_LIMIT = 5
    }

}