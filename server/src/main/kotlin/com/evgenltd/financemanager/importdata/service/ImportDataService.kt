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
        private val documentService: DocumentService
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
    
    fun list(): List<ImportDataRecord> =
            importDataRepository.findAll().map {
                ImportDataRecord(
                        id = it.id,
                        account = it.account,
                        template = it.template,
                        file = it.file,
                        documents = listOf(),
                        other = listOf()
                )
            }

    fun byId(id: String): ImportDataRecord {

        val dataImport = importDataRepository.find(id)

        val existedDocuments = documentService.findDocumentByAccount(dataImport.account)
                .asIndex()
                .toMutableMap()

        val generator = IdGenerator()
        val documents = dataImport.documents.map {
            val existed = it.suggested?.let { suggested ->
                val hash = generator.next(suggested.hash())
                existedDocuments.remove(hash)?.toTypedRecord()
            }

            DocumentEntryRecord(
                    it.id,
                    it.source,
                    it.suggested?.toTypedRecord(),
                    existed
            )
        }

        return ImportDataRecord(
                id = dataImport.id,
                account = dataImport.account,
                template = dataImport.template,
                file = dataImport.file,
                documents = documents,
                other = existedDocuments.values.map { it.toTypedRecord() }
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

        val path = Paths.get(importDataProperties.directory, entity.file)
        entity.documents = importDataTemplates.first { it.javaClass.simpleName == entity.template }
                .convert(entity.account, path)
                .onEach {
                    val suggested = it.suggested
                    if (suggested != null) {
                        suggested.description = generateDescription(suggested)
                    }
                }

        importDataRepository.save(entity)
    }

    fun updateDocumentEntry(id: String, entryRecord: DocumentEntryRecord) {
        val importData = importDataRepository.find(id)
        importData.documents
                .find { it.id == entryRecord.id }
                ?.let {
                    it.suggested = entryRecord.suggested?.toEntity()
                    it.suggested?.let { suggested ->
                        suggested.description = generateDescription(suggested)
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

    private fun generateDescription(document: Document): String = when (document) {
        is DocumentExpense -> "${document.amount}"
        is DocumentIncome -> "${document.amount}"
        is DocumentExchange -> "${document.amountFrom} -> ${document.amountTo}"
        else -> throw IllegalStateException("Unknown document type ${document::class}")
    }

    private fun Document.hash(): String = when (this) {
        is DocumentExpense -> "$date-$amount-$account-$expenseCategory"
        is DocumentIncome -> "$date-$amount-$account-$incomeCategory"
        is DocumentExchange -> "$date-$amountFrom"
        else -> id ?: System.currentTimeMillis().toString()
    }

    private fun List<Document>.asIndex(): Map<String,Document> {
        val generator = IdGenerator()
        return this.associateBy { generator.next(it.hash()) }
    }

}