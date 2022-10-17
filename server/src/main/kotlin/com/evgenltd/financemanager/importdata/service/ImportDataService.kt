package com.evgenltd.financemanager.importdata.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.IdGenerator
import com.evgenltd.financemanager.importdata.entity.ImportData
import com.evgenltd.financemanager.importdata.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importdata.record.ImportDataRecord
import com.evgenltd.financemanager.importdata.repository.ImportDataRepository
import com.evgenltd.financemanager.importdata.service.template.ImportDataTemplate
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID
import javax.annotation.PostConstruct
import kotlin.reflect.full.findAnnotation

@Service
class ImportDataService(
        private val importDataProperties: ImportDataProperties,
        private val importDataRepository: ImportDataRepository,
        private val importDataTemplates: List<ImportDataTemplate>,
        private val accountTransactionService: AccountTransactionService
) {

    @PostConstruct
    fun postConstruct() {
        Files.createDirectories(Paths.get(importDataProperties.directory))
    }
    
    fun listReference(): List<Reference> = importDataTemplates.map {
        Reference(
                it.javaClass.simpleName,
                it.javaClass.simpleName,
                false
        )
    }
    
    fun list(): List<ImportDataRecord> =
            importDataRepository.findAll().map {
                ImportDataRecord(
                        id = it.id,
                        account = it.account,
                        template = it.template,
                        file = it.file,
                        entries = listOf()
                )
            }

    fun byId(id: String): ImportDataRecord {

        val dataImport = importDataRepository.find(id)
        val entries = dataImport.mapEntries()
                .associateBy { it.id }
                .toMutableMap()

        accountTransactionService.transactionsByAccount(dataImport.account!!)
                .mapEntries()
                .onEach {
                    val fromDb = entries[it.id]
                    if (fromDb != null) {
                        entries[it.id] = merge(fromDb, it)
                    } else {
                        entries[it.id] = it
                    }
                }

        return ImportDataRecord(
                id = dataImport.id,
                account = dataImport.account,
                template = dataImport.template,
                file = dataImport.file,
                entries.values.sortedBy { it.id }
        )

    }

    private fun ImportData.mapEntries(): List<ImportDataEntryRecord> {
        val idGenerator = IdGenerator()
        return entries.map {
            ImportDataEntryRecord(
                    id = idGenerator.next(it.date, it.direction, it.amount),
                    fromDb = false,
                    fromFile = true,
                    systemId = null,
                    date = it.date,
                    direction = it.direction,
                    amount = it.amount,
                    description = it.description
            )
        }
    }

    private fun List<AccountTransaction>.mapEntries(): List<ImportDataEntryRecord> {
        val idGenerator = IdGenerator()
        return map {
            ImportDataEntryRecord(
                    id = idGenerator.next(it.date, it.direction, it.amount),
                    fromDb = true,
                    fromFile = false,
                    systemId = it.id,
                    date = it.date,
                    direction = it.direction,
                    amount = it.amount,
                    description = ""
            )
        }
    }

    private fun merge(fromFile: ImportDataEntryRecord, fromDb: ImportDataEntryRecord): ImportDataEntryRecord = ImportDataEntryRecord(
            id = fromFile.id,
            fromDb = true,
            fromFile = true,
            systemId = fromDb.systemId,
            date = fromFile.date,
            direction = fromFile.direction,
            amount = fromFile.amount,
            description = fromFile.description
    )

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
        val importDataTemplate = importDataTemplates.first { it.javaClass.simpleName == entity.template }
        val entries = importDataTemplate.convert(path)

        entity.entries = entries
        importDataRepository.save(entity)
    }

    fun performImport(importData: ImportDataRecord) {
        val transactions = importData.entries.map {
            AccountTransaction(
                    null,
                    it.date,
                    it.direction,
                    it.amount,
                    importData.account!!
            )
        }
        accountTransactionService.createTransactions(transactions)
    }

    fun delete(id: String) = importDataRepository.deleteById(id)

    private fun ImportDataRecord.toEntity(): ImportData = ImportData(
            id = id,
            account = account,
            template = template,
            file = file,
            entries = emptyList()
    )
    
}