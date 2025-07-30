package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataOperationRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataTotalRepository
import com.evgenltd.financemanager.importexport2.record.EntryFilter
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryGroupRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.byAccount
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataOperationRepository: ImportDataOperationRepository,
    private val importDataTotalRepository: ImportDataTotalRepository,
) {

    fun list(): List<Reference> = importDataRepository.findAll()
        .map { importDataConverter.toReference(it) }

    @SkipLogging
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
        val dateRange = importDataEntryRepository.findImportDataDateRange(importData)
        val totals = importDataTotalRepository.findByImportDataAndDateIsNull(importData)
        return importDataConverter.toRecord(importData, dateRange, totals)
    }

    @SkipLogging
    fun entryList(id: UUID, request: EntryFilter): List<ImportDataEntryGroupRecord> {
        val importData = importDataRepository.find(id)

        val dateRange = request.date.validRange()

        val totalIndex = importDataTotalRepository.findAll((ImportDataTotal::date between dateRange) and (ImportDataTotal::importData eq importData))
            .groupBy { it.date }

        val operationIndex = ((Operation::date between dateRange) and byAccount(importData.account))
            .let { operationRepository.findAll(it) }
            .associateBy { it.id }
            .toMutableMap()

        val entries = ((ImportDataEntry::importData eq  importData) and (ImportDataEntry::date between dateRange))
            .let { importDataEntryRepository.findAll(it) }
            .map {
                operationIndex.remove(it.operation?.id)
                it.date to ImportDataEntryRecord(
                    id = it.id,
                    operation = it.operation?.let { operation -> operationConverter.toRecord(operation) },
                    operationVisible = it.operation?.id !in importData.hiddenOperations,
                    parsed = it.operations
                        .firstOrNull { operation -> operation.importType == ImportDataOperationType.PARSED }
                        ?.let { operation -> importDataConverter.toRecord(operation) },
                    parsedVisible = it.visible,
                    suggestions = it.operations
                        .filter { operation -> operation.importType == ImportDataOperationType.SUGGESTION }
                        .map { operation -> importDataConverter.toRecord(operation) },
                )
            }

        val consolidated = entries + operationIndex.values
            .map { it.date to ImportDataEntryRecord(operation = operationConverter.toRecord(it), operationVisible = it.id !in importData.hiddenOperations) }

        return consolidated.groupBy({ it.first }) { it.second }
            .map { (date, records) ->
                ImportDataEntryGroupRecord(
                    date = date,
                    totals = totalIndex[date]
                        ?.let { importDataConverter.toRecords(it) }
                        ?: emptyList(),
                    entries = records
                )
            }
            .sortedBy { it.date }
    }

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account, progress = true)
        return importDataRepository.save(importData)
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

    private fun DateRange?.validRange(): Range<LocalDate> {
        val actualFrom = this?.from ?: this?.to ?: LocalDate.now()
        val actualTo = actualFrom.plusWeeks(1L)
        return Range(actualFrom, actualTo)
    }

}