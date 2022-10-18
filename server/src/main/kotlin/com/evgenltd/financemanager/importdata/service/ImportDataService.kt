package com.evgenltd.financemanager.importdata.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importdata.entity.ImportData
import com.evgenltd.financemanager.importdata.entity.ImportDataEntry
import com.evgenltd.financemanager.importdata.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importdata.record.ImportDataRecord
import com.evgenltd.financemanager.importdata.record.ImportDataRelatedDocument
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
                        entries = listOf(),
                        documents = listOf()
                )
            }

    fun byId(id: String): ImportDataRecord {

        val dataImport = importDataRepository.find(id)
        val documents = accountTransactionService.findTransactionByAccount(dataImport.account)
                .map { ImportDataRelatedDocument(it.id!!, it.date) }

        return ImportDataRecord(
                id = dataImport.id,
                account = dataImport.account,
                template = dataImport.template,
                file = dataImport.file,
                entries = dataImport.entries
                        .map {
                            ImportDataEntryRecord(
                                    id = it.id,
                                    date = it.date,
                                    direction = it.direction,
                                    amount = it.amount,
                                    description = it.description,
                                    imported = it.imported
                            )
                        },
                documents = documents
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
        entity.entries = importDataTemplates.first { it.javaClass.simpleName == entity.template }
                .convert(path)

        val transactions = accountTransactionService.findTransactionByAccount(entity.account)
                .map { it.asString() }
                .groupBy { it }
                .filter { it.value.size == 1 }
                .keys

        entity.entries.onEach {
            if (transactions.contains(it.asString())) {
                it.imported = true
            }
        }

        importDataRepository.save(entity)
    }

    fun performImport(importData: ImportDataRecord) {
//        val transactions = importData.entries.map {
//            AccountTransaction(
//                    null,
//                    it.date,
//                    it.direction,
//                    it.amount,
//                    importData.account!!
//            )
//        }
//        accountTransactionService.createTransactions(transactions)
    }

    fun delete(id: String) = importDataRepository.deleteById(id)

    private fun ImportDataRecord.toEntity(): ImportData = ImportData(
            id = id,
            account = account,
            template = template,
            file = file,
            entries = emptyList()
    )

    private fun AccountTransaction.asString() = "$date-$direction-$amount"

    private fun ImportDataEntry.asString() = "$date-$direction-$amount"

}