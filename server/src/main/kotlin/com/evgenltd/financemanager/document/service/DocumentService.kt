package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.DocumentRecord
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import org.springframework.stereotype.Service

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val accountTransactionService: AccountTransactionService
) {

    fun list(): List<DocumentRecord> = documentRepository.findAll().map { it.toRecord() }

    fun delete(id: String) = documentRepository.deleteById(id)

    fun findDocumentByAccount(account: String): List<Document> {
        val transactionIds = accountTransactionService.findTransactionByAccount(account)
                .map { it.id }
        return documentRepository.findAllById(transactionIds)
                .toList()
    }

    private fun Document.toRecord(): DocumentRecord = DocumentRecord(
                id!!,
                date,
                this::class.simpleName ?: "Unknown"
        )

}