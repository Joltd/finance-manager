package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val accountTransactionService: AccountTransactionService,
        private val transactionService: TransactionService,
        private val documentTypedServices: List<DocumentTypedService<*,*>>,
) {

    private lateinit var index: Map<String,DocumentTypedService<*,*>>

    @PostConstruct()
    fun postConstruct() {
        index = documentTypedServices.associateBy { resolveType(it) }
    }

    fun list(): List<DocumentTypedRecord> = documentRepository.findAll().map(::toTypedRecord)

    fun byId(id: String): DocumentTypedRecord = documentRepository.find(id).let(::toTypedRecord)

    fun update(record: DocumentTypedRecord) = resolveService(record.value).update(record.value)

    fun delete(id: String) {
        transactionService.deleteByDocument(id)
        documentRepository.deleteById(id)
    }

    fun findDocumentByAccount(account: String): List<DocumentTypedRecord> {
        val transactionIds = accountTransactionService.findTransactionByAccount(account).map { it.document }
        return documentRepository.findAllById(transactionIds)
                .map(::toTypedRecord)
    }

    fun hash(record: DocumentRecord, account: String): String = resolveService(record).hash(record, account)

    fun toEntity(record: DocumentRecord): Document = resolveService(record).toEntity(record)

    fun toRecord(entity: Document): DocumentRecord = resolveService(entity).toRecord(entity)

    fun toTypedRecord(entity: Document): DocumentTypedRecord = DocumentTypedRecord(
            resolveType(entity),
            toRecord(entity)
    )

    @Suppress("UNCHECKED_CAST")
    private fun resolveService(any: Any): DocumentTypedService<Document, DocumentRecord> {
        val type = resolveType(any)
        return (index[type] ?: throw IllegalArgumentException("Unknown type $type")) as DocumentTypedService<Document, DocumentRecord>
    }

    private fun resolveType(any: Any): String = any::class.simpleName!!
            .replace("Record", "")
            .replace("Document", "")
            .replace("Service", "")
            .lowercase()

}