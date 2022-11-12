package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.IdGenerator
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.DocumentEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*
import javax.annotation.PostConstruct
import kotlin.io.path.deleteIfExists

@Service
class ImportDataService(
        private val importDataProperties: ImportDataProperties,
        private val importDataRepository: ImportDataRepository,
        private val documentService: DocumentService,
        private val importDataConverter: ImportDataConverter
) : Loggable() {

    @PostConstruct
    fun postConstruct() {
        Files.createDirectories(Paths.get(importDataProperties.directory))
    }
    
    fun list(): List<ImportDataRecord> = importDataRepository.findAll().map {
        val done = it.documents.count { it.result != null }
        ImportDataRecord(
                id = it.id,
                file = it.file,
                description = it.description,
                documents = listOf(),
                currentProgress = 1.0 * done / it.documents.size
        )
    }

    fun byId(id: String): ImportDataRecord {

        val dataImport = importDataRepository.find(id)

        val existedDocuments = documentService.list()
                .asIndex()
                .toMutableMap()

        val generator = IdGenerator()
        val documents = dataImport.documents.map { document ->
            val suggested = document.suggested?.let(documentService::toTypedRecord)
            val existed = suggested?.let {
                val hash = generator.next(documentService.hash(it.value))
                existedDocuments.remove(hash)
            }

            DocumentEntryRecord(
                    id = document.id,
                    source = document.source,
                    suggested = suggested,
                    existed = existed,
                    result = document.result,
                    message = document.message
            )
        }

        return ImportDataRecord(
                id = dataImport.id,
                file = dataImport.file,
                description = dataImport.description,
                documents = documents
        )

    }

    fun delete(id: String) {
        val entity = importDataRepository.find(id)
        Paths.get(importDataProperties.directory, entity.file).deleteIfExists()
        importDataRepository.delete(entity)
    }

    fun uploadFile(file: MultipartFile): String {
        val filename = UUID.randomUUID().toString()
        Files.copy(
                file.inputStream,
                Paths.get(importDataProperties.directory, filename)
        )
        return filename
    }

    fun create(record: ImportDataRecord) {
        val entity = record.toEntity()
        create(entity)
    }

    fun reCreate(id: String) {
        val importData = importDataRepository.find(id)
        create(importData)
    }

    private fun create(entity: ImportData) {
        val path = Paths.get(importDataProperties.directory, entity.file)
        entity.documents = importDataConverter.convert(path)
        importDataRepository.save(entity)
    }

    fun updateDocumentEntry(id: String, entryRecord: DocumentEntryRecord) {
        val importData = importDataRepository.find(id)
        importData.documents
                .find { it.id == entryRecord.id }
                ?.let {
                    it.suggested = entryRecord.suggested?.let {
                        suggested -> documentService.toEntity(suggested.value)
                    }
                }
        importDataRepository.save(importData)
    }

    @Async
    fun performImport(id: String, documents: List<String>) {
        val entity = importDataRepository.find(id)
        val forImport = documents.toSet()

        var counter = 0
        for (document in entity.documents) {
            document.result = null
            document.message = null
            if (forImport.isNotEmpty() && !forImport.contains(document.id)) {
                continue
            }

            val suggested = document.suggested ?: continue

            try {
                documentService.update(suggested)
                document.result = true
            } catch (e: Exception) {
                log.error("Unable to store document", e)
                document.result = false
                document.message = e.message ?: e::class.simpleName ?: "Unknown error"
            }

            if (counter % 100 == 0) {
                importDataRepository.save(entity)
            }
            counter++
        }

        importDataRepository.save(entity)
    }

    fun deleteAllFiles() {
        for (path in Paths.get(importDataProperties.directory)) {
            try {
                path.deleteIfExists()
            } catch (e: Exception) {
                log.error("Unable to delete file $path", e)
            }
        }
        Files.createDirectories(Paths.get(importDataProperties.directory))
    }

    private fun ImportDataRecord.toEntity(): ImportData = ImportData(id = id, file = file, description = description, documents = emptyList())

    private fun List<DocumentTypedRecord>.asIndex(): Map<String,DocumentTypedRecord> {
        val generator = IdGenerator()
        return this.associateBy { generator.next(documentService.hash(it.value)) }
    }

}