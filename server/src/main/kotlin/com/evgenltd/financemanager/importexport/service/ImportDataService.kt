package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.ImportDataEntryForRemoveRecord
import com.evgenltd.financemanager.importexport.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.io.File
import java.util.*
import javax.annotation.PostConstruct

@Service
class ImportDataService(
        private val importDataProperties: ImportDataProperties,
        private val importDataRepository: ImportDataRepository,
        private val documentService: DocumentService,
        private val importDataConverter: ImportDataConverter
) : Loggable() {

    @PostConstruct
    fun postConstruct() {
        File(importDataProperties.directory).deleteRecursively()
    }

    fun list(): List<ImportDataRecord> = importDataRepository.findAll().map {
            ImportDataRecord(
                id = it.id,
                description = it.description,
                entries = emptyList()
            )
        }

    fun byId(id: String): ImportDataRecord = importDataRepository.find(id).toRecord()

    fun entryById(id: String, entryId: String): ImportDataEntryRecord =
        importDataRepository.find(id)
            .entries
            .find { it.id == entryId }
            ?.toRecord()
            ?: throw IllegalArgumentException("Entry [$entryId] not found")

    fun forRemove(id: String, entryId: String): ImportDataEntryForRemoveRecord =
        ImportDataEntryForRemoveRecord(
            importDataRepository.find(id)
                .entries
                .find { it.id == entryId }
                ?.forRemove ?: emptySet()
        )

    fun update(record: ImportDataRecord): ImportDataRecord {
        val importData = record.toEntity()
        val saved = importDataRepository.save(importData)
        return saved.toRecord()
    }

    fun entryUpdate(id: String, entryId: String, entry: ImportDataEntryRecord) {
        val importData = importDataRepository.find(id)
        importData
            .entries
            .find { it.id == entryId }
            ?.let {
                it.suggested = entry.suggested?.let { suggested -> documentService.toEntity(suggested.value) }
                it.forRemove = entry.forRemove.mapNotNull { document -> document.value.id() }.toSet()
                importDataRepository.save(importData)
            }
    }

    fun forRemoveUpdate(id: String, entryId: String, forRemove: ImportDataEntryForRemoveRecord) {
        val importData = importDataRepository.find(id)
        importData.entries
            .find { it.id == entryId }
            ?.let {
                it.forRemove = forRemove.documents
                importDataRepository.save(importData)
            }
    }

    fun append(id: String, entries: List<ImportDataEntryRecord>) {
        val importData = importDataRepository.find(id)
        importData.entries = importData.entries + entries.map { it.toEntity() }
        importDataRepository.save(importData)
    }

    fun delete(id: String) = importDataRepository.deleteById(id)

    @Async
    fun performImport(id: String) {
        val entity = importDataRepository.find(id)

        var counter = 0
        for (document in entity.entries) {
            document.result = null
            document.message = null

            if (!document.skip) {
                val suggested = document.suggested ?: continue

                try {
                    documentService.update(suggested)
                    document.result = true
                } catch (e: Exception) {
                    log.error("Unable to store document", e)
                    document.result = false
                    document.message = e.message ?: e::class.simpleName ?: "Unknown error"
                }
            }

            if (counter % 100 == 0) {
                importDataRepository.save(entity)
            }
            counter++
        }

        importDataRepository.save(entity)
    }

    private fun ImportDataRecord.toEntity(): ImportData = ImportData(
        id = id,
        description = description,
        entries = entries.map { it.toEntity() }
    )

    private fun ImportDataEntryRecord.toEntity(): ImportDataEntry = ImportDataEntry(
        id = id ?: UUID.randomUUID().toString(),
        raw = raw,
        suggested = suggested?.value?.let { documentService.toEntity(it) },
        skip = skip,
        result = null,
        message = null
    )

    private fun ImportData.toRecord(): ImportDataRecord = ImportDataRecord(
        id = id,
        description = description,
        entries = entries.map { it.toRecord() }
    )

    private fun ImportDataEntry.toRecord(): ImportDataEntryRecord = ImportDataEntryRecord(
        id = id,
        raw = raw,
        suggested = suggested?.let { documentService.toTypedRecord(it) },
        skip = skip,
        result = result,
        message = message,
        forRemove = forRemove.map { documentService.byId(it) }
    )

}