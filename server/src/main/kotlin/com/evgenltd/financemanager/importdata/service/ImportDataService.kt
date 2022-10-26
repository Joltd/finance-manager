package com.evgenltd.financemanager.importdata.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.IdGenerator
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importdata.entity.ImportData
import com.evgenltd.financemanager.importdata.record.*
import com.evgenltd.financemanager.importdata.repository.ImportDataRepository
import com.evgenltd.financemanager.importdata.service.template.ImportDataTemplate
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID
import javax.annotation.PostConstruct

@Service
class ImportDataService(
        private val importDataProperties: ImportDataProperties,
        private val importDataRepository: ImportDataRepository,
        private val importDataTemplates: List<ImportDataTemplate>,
        private val documentService: DocumentService,
        private val accountRepository: AccountRepository
) : Loggable() {

    @PostConstruct
    fun postConstruct() {
        Files.createDirectories(Paths.get(importDataProperties.directory))
    }
    
    fun listReference(): List<Reference> = importDataTemplates.map {
        Reference(
                id = it.javaClass.simpleName,
                name = it.javaClass.simpleName,
                deleted = false
        )
    }
    
    fun list(): List<ImportDataRecord> {
        val accounts = accountRepository.findAll().associateBy { it.id }
        return importDataRepository.findAll().map {
            ImportDataRecord(
                    id = it.id,
                    account = accounts[it.account]?.name ?: it.account,
                    template = it.template,
                    file = it.file,
                    documents = listOf(),
                    other = listOf()
            )
        }
    }

    fun byId(id: String): ImportDataRecord {

        val dataImport = importDataRepository.find(id)

        val existedDocuments = documentService.findDocumentByAccount(dataImport.account)
                .asIndex(dataImport.account)
                .toMutableMap()

        val generator = IdGenerator()
        val documents = dataImport.documents.map { document ->
            val suggested = document.suggested?.let(documentService::toTypedRecord)
            val existed = suggested?.let {
                val hash = generator.next(documentService.hash(it.value, dataImport.account))
                existedDocuments.remove(hash)
            }

            DocumentEntryRecord(
                    document.id,
                    document.source,
                    suggested,
                    existed
            )
        }

        return ImportDataRecord(
                id = dataImport.id,
                account = dataImport.account,
                template = dataImport.template,
                file = dataImport.file,
                documents = documents,
                other = existedDocuments.values.toList()
        )

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
        entity.documents = importDataTemplates.first { it.javaClass.simpleName == entity.template }
                .convert(entity.account, path)

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

    fun performImport(document: DocumentTypedRecord): ImportDataResult = try {
        documentService.update(document)
        ImportDataResult(true)
    } catch (e: Exception) {
        log.error("Unable to import document $document", e)
        ImportDataResult(false)
    }

    fun delete(id: String) = importDataRepository.deleteById(id)

    private fun ImportDataRecord.toEntity(): ImportData = ImportData(
            id = id,
            account = account,
            template = template,
            file = file,
            documents = emptyList()
    )

    private fun List<DocumentTypedRecord>.asIndex(account: String): Map<String,DocumentTypedRecord> {
        val generator = IdGenerator()
        return this.associateBy { generator.next(documentService.hash(it.value, account)) }
    }

}