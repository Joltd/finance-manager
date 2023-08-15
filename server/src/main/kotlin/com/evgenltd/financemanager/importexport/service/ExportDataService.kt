package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.component.FIELDS
import com.evgenltd.financemanager.importexport.component.exportDocument
import org.springframework.stereotype.Service

@Service
class ExportDataService(private val documentService: DocumentService) {

    fun performExport(account: String?): ByteArray {
        val data = documentService.findTypedDocumentByAccount(account)
                .joinToString("\n") { record -> exportDocument(record) }
        val header = FIELDS.joinToString(",")
        return "$header\n$data".toByteArray()
    }

}