package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.DocumentRecord
import com.evgenltd.financemanager.document.service.DocumentService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class DocumentController(
        private val documentService: DocumentService
) {

    @GetMapping("/document")
    fun list(): List<DocumentRecord> = documentService.list()

}