package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.record.EntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataDayRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.byAccount
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.containsNot
import com.evgenltd.financemanager.common.repository.emptySpecification
import com.evgenltd.financemanager.common.service.validWeek
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.*

@Service
@SkipLogging
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val operationRepository: OperationRepository,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataDayRepository: ImportDataDayRepository,
) {

    @SkipLogging
    fun list(): List<Reference> = importDataRepository.findAll()
        .map { importDataConverter.toReference(it) }

    @Transactional
    @SkipLogging
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
        val dateRange = importDataDayRepository.findImportDataDateRange(importData)
        return importDataConverter.toRecord(importData, dateRange)
    }

    @SkipLogging
    fun entryList(id: UUID, request: EntryFilter): List<ImportDataDayRecord> {
        val importData = importDataRepository.find(id)

        val dateRange = request.date.validWeek()

        val days = ((ImportDataDay::importData eq importData) and
                (ImportDataDay::date between dateRange) and
                (ImportDataDay::valid eq request.totalValid))
            .let { importDataDayRepository.findAll(it) }

        val linkedOperations = days.flatMap { it.entries }
            .mapNotNull { it.operation }
            .mapNotNull { it.id }

        val actualDates = days.map { it.date }

        val freeOperations = ((Operation::date contains actualDates) and
                byAccount(importData.account) and
                (request.operationVisible?.let { Operation::id containsNot importData.hiddenOperations } ?: emptySpecification()) and
                (Operation::id containsNot linkedOperations))
            .let { operationRepository.findAll(it) }
            .groupBy { it.date }

        return days.map { day ->
            val operations = freeOperations[day.date]
                ?.map { importDataConverter.toRecord(importData, it) }
                ?: emptyList()
            val entries = day.entries
                .filter { request.entryVisible == null || it.visible == request.entryVisible }
                .filter { request.linkage == null || (it.operation == null) == request.linkage }
                .map { importDataConverter.toRecord(importData, it) }
            ImportDataDayRecord(
                date = day.date,
                valid = day.valid,
                totals = day.totals.map { importDataConverter.toRecord(it) },
                entries = entries + operations,
            )
        }.sortedBy { it.date }
    }

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account, currency = request.currency, progress = true)
        return importDataRepository.save(importData)
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

}