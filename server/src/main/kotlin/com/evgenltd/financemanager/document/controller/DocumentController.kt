package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.service.DocumentService
import org.springframework.web.bind.annotation.*

@RestController
class DocumentController(
        private val documentService: DocumentService
) {

    @PostMapping("/document/filter")
    fun list(@RequestBody filter: DocumentFilter): DocumentPage = documentService.list(filter)

    @PostMapping("/document/daily")
    fun listDaily(@RequestBody filter: DocumentDailyFilter): List<DocumentTypedRecord> = documentService.listDaily(filter)

    @GetMapping("/document/{id}")
    fun byId(@PathVariable("id") id: String): DocumentTypedRecord = documentService.byId(id)

    @PostMapping("/document")
    fun update(@RequestBody record: DocumentTypedRecord) = documentService.update(record)

    @DeleteMapping("/document/{id}")
    fun delete(@PathVariable("id") id: String) = documentService.delete(id)

    @DeleteMapping("/account/{id}/document")
    fun deleteByAccount(@PathVariable("id") account: String) = documentService.deleteByAccount(account)
}