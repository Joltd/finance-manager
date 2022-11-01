package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.service.DocumentService
import org.springframework.web.bind.annotation.*

@RestController
class DocumentController(
        private val documentService: DocumentService
) {

    @GetMapping("/document")
    fun list(): List<DocumentTypedRecord> = documentService.list()

    @GetMapping("/document/{id}")
    fun byId(@PathVariable("id") id: String): DocumentTypedRecord = documentService.byId(id)

    @PostMapping("/document")
    fun update(@RequestBody record: DocumentTypedRecord) = documentService.update(record)

    @DeleteMapping("/document/{id}")
    fun delete(@PathVariable("id") id: String) = documentService.delete(id)

}