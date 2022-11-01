package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.component.FIELDS
import com.evgenltd.financemanager.importexport.component.exportDocument
import com.evgenltd.financemanager.importexport.record.ExportDataResult
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service

@Service
class ExportDataService(
        private val accountRepository: AccountRepository,
        private val documentService: DocumentService
) {

    fun performExport(account: String): ExportDataResult {
        val accountName = accountRepository.find(account).name
        val tag = "data-$accountName.csv"

        val data = documentService.findDocumentByAccount(account)
                .joinToString("\n") { record -> exportDocument(record) }
        val header = FIELDS.joinToString(",")
        return ExportDataResult(
                tag,
                "$header\n$data".toByteArray()
        )
    }

}