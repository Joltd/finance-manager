package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.isNotNull
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataTotalRepository
import com.evgenltd.financemanager.importexport2.record.EntryFilter
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryGroupRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.byAccount
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.common.service.validWeek
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport2.record.ImportDataSuggestionRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataSuggestionSimilarRecord
import com.evgenltd.financemanager.operation.converter.OperationConverter
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val operationRepository: OperationRepository,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataTotalRepository: ImportDataTotalRepository,
    private val operationConverter: OperationConverter,
) {

    @SkipLogging
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

        val dateRange = request.date.validWeek()

        val totalIndex = ((ImportDataTotal::date between dateRange) and
                (ImportDataTotal::importData eq importData) and
                ImportDataTotal::date.isNotNull())
            .let { importDataTotalRepository.findAll(it) }
            .groupBy { it.date!! }
            .mapValues { (date, totals) -> importDataConverter.toEntryGroupRecord(date, totals) }

        val actualDates = totalIndex.filterValues {
            when (request.totalValid) {
                true -> it.valid == true
                false -> it.valid == false
                else -> true
            }
        }.keys

        val operationIndex = ((Operation::date between dateRange) and byAccount(importData.account))
            .let { operationRepository.findAll(it) }
            .filter {
                when (request.operationVisible) {
                    true -> it.id !in importData.hiddenOperations
                    false -> it.id in importData.hiddenOperations
                    else -> true
                }
            }
            .filter { request.totalValid == null || it.date in actualDates }
            .associateBy { it.id }
            .toMutableMap()

        val entries = ((ImportDataEntry::importData eq  importData) and
                (ImportDataEntry::date between dateRange) and
                (ImportDataEntry::visible eq request.entryVisible))
            .let { importDataEntryRepository.findAll(it) }
            .filter { request.totalValid == null || it.date in actualDates }
            .map {
                operationIndex.remove(it.operation?.id)
                it.date to importDataConverter.toEntryRecord(importData, it)
            }

        val consolidated = entries + operationIndex.values
            .map { it.date to importDataConverter.toEntryRecord(importData, it) }

        return consolidated.groupBy { it.first }
            .mapValues { (_, records) ->
                records.map { it.second }
                    .sortedWith(compareBy(
                        { it.parsed?.amountFrom?.currency ?: "" },
                        { it.parsed?.amountFrom?.value ?: 0 },
                        { it.operation?.amountFrom?.currency ?: "" },
                        { it.operation?.amountFrom?.value ?: 0 },
                    ))
            }
            .map { (date, records) ->
                totalIndex[date]
                    ?.copy(entries = records)
                    ?: ImportDataEntryGroupRecord(date, entries = records)
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

}