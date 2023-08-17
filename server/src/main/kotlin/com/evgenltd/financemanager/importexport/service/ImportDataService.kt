package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.record.ImportDataEntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataEntryPage
import com.evgenltd.financemanager.importexport.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.AccountService
import org.springframework.data.domain.PageRequest
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.*
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class ImportDataService(
    private val importDataRepository: ImportDataRepository,
    private val importDataProcessService: ImportDataProcessService,
    private val accountService: AccountService,
    private val documentService: DocumentService,
    private val categoryMappingService: CategoryMappingService,
    private val importParsers: List<ImportParser>,
    private val mongoTemplate: MongoTemplate
) {

    fun parserList(): List<Reference> = importParsers.map { Reference(it.id, it.name, false) }

    fun list(): List<ImportDataRecord> = importDataRepository.findAll().map { it.toRecord() }

    fun entryList(id: String, filter: ImportDataEntryFilter): ImportDataEntryPage {
        var query = Query().addCriteria(Criteria.where(ImportDataEntry::importData.name).isEqualTo(id))
        val count = mongoTemplate.count(query, ImportDataEntry::class.java)
        query = Query().with(PageRequest.of(filter.page, filter.size))
        return ImportDataEntryPage(
            total = count,
            page = filter.page,
            size = filter.size,
            entries = mongoTemplate.find(query, ImportDataEntry::class.java)
                .map { it.toRecord() }
        )
    }

    fun byId(id: String): ImportDataRecord = importDataRepository.find(id).toRecord()

    fun delete(id: String) {
        val query = Criteria().andOperator(
            Criteria.where(ImportData::id.name).isEqualTo(id),
            Criteria.where(ImportData::status.name).inValues(ImportDataStatus.NEW, ImportDataStatus.PREPARE_DONE, ImportDataStatus.IMPORT_DONE, ImportDataStatus.FAILED)
        ).let { Query.query(it) }
        mongoTemplate.findAndRemove(query, ImportData::class.java)
    }

    fun startPreparation(
        parser: String,
        account: String,
        file: MultipartFile
    ) {
        val importData = ImportData(
            id = null,
            parser = parser,
            account = account,
            status = ImportDataStatus.NEW,
            message = null,
            progress = .0
        )
        val result = importDataRepository.save(importData)
        importDataProcessService.startPreparation(file.inputStream, result.id!!)
    }

    fun repeatPreparation(id: String) {
        importDataProcessService.repeatPreparation(id)
    }

    fun cancelPreparation(id: String) {
        importDataProcessService.cancelPreparation(id)
    }

    fun startImport(id: String) {
        importDataProcessService.startImport(id)
    }

    fun cancelImport(id: String) {
        importDataProcessService.cancelImport(id)
    }

    private fun ImportData.toRecord(): ImportDataRecord = ImportDataRecord(
        id = id!!,
        parser = parser,
        account = account,
        accountName = accountService.name(account),
        status = status,
        message = message,
        progress = progress
    )

    private fun ImportDataEntry.toRecord(): ImportDataEntryRecord = ImportDataEntryRecord(
        id = id!!,
        parsedEntry = parsedEntry,
        suggestedDocument = suggestedDocument?.let { documentService.toTypedRecord(it) },
        existedDocuments = documentService.list(existedDocuments),
        matchedCategoryMappings = matchedCategoryMappings.map { categoryMappingService.toCategoryMappingRecord(it) },
        preparationResult = preparationResult,
        preparationError = preparationError,
        option = option,
        importResult = importResult,
        importError = importError
    )

}