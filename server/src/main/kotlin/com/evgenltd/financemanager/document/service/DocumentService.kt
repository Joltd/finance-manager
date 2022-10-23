package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.DocumentRecord
import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val accountTransactionService: AccountTransactionService,
        private val transactionService: TransactionService
) {

    fun list(): List<DocumentRecord> = documentRepository.findAll().map { it.toSimpleRecord() }

    fun byId(id: String): DocumentTypedRecord = documentRepository.find(id).toTypedRecord()

    fun update(record: DocumentTypedRecord) {
        println()
    }

    fun delete(id: String) {
        transactionService.deleteByDocument(id)
        documentRepository.deleteById(id)
    }

    fun findDocumentByAccount(account: String): List<Document> {
        val transactionIds = accountTransactionService.findTransactionByAccount(account).map { it.id }
        return documentRepository.findAllById(transactionIds).toList()
    }

}