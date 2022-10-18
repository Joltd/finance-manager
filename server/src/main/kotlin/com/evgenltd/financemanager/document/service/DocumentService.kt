package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import org.springframework.stereotype.Service

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val accountTransactionService: AccountTransactionService
) {

    fun findDocumentByAccount(account: String): List<Document> {
        val transactionIds = accountTransactionService.findTransactionByAccount(account)
                .map { it.id }
        return documentRepository.findAllById(transactionIds)
                .toList()
    }

}