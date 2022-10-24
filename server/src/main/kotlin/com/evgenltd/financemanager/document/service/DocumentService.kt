package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.repository.DocumentRepository
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentService(
        private val documentRepository: DocumentRepository,
        private val accountTransactionService: AccountTransactionService,
        private val transactionService: TransactionService,
        private val documentExpenseService: DocumentExpenseService,
        private val documentIncomeService: DocumentIncomeService,
        private val documentExchangeService: DocumentExchangeService
) {

    fun list(): List<DocumentRowRecord> = documentRepository.findAll().map { it.toSimpleRecord() }

    fun byId(id: String): DocumentTypedRecord = documentRepository.find(id).toTypedRecord()

    fun update(record: DocumentTypedRecord) {
        when (record.value) {
            is DocumentExpenseRecord -> documentExpenseService.update(record.value)
            is DocumentIncomeRecord -> documentIncomeService.update(record.value)
            is DocumentExchangeRecord -> documentExchangeService.update(record.value)
            else -> throw IllegalStateException("Unknown document type ${record.type}")
        }
    }

    fun delete(id: String) {
        transactionService.deleteByDocument(id)
        documentRepository.deleteById(id)
    }

    fun findDocumentByAccount(account: String): List<Document> {
        val transactionIds = accountTransactionService.findTransactionByAccount(account).map { it.document }
        return documentRepository.findAllById(transactionIds).toList()
    }

}