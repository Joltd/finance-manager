package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.record.DocumentEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataFilerResponse
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.record.ImportDataResult
import com.evgenltd.financemanager.importexport.service.ImportDataService
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
class ImportDataController(
        private val importDataService: ImportDataService
) {

    @GetMapping("/import-data/reference")
    fun listReference(
            @RequestParam("mask", required = false) mask: String?,
            @RequestParam("id", required = false) id: String?
    ): List<Reference> = importDataService.listReference()

    @GetMapping("/import-data")
    fun list(): List<ImportDataRecord> = importDataService.list()

    @GetMapping("/import-data/{id}")
    fun byId(@PathVariable("id") id: String): ImportDataRecord = importDataService.byId(id)

    @PostMapping("/import-data")
    fun create(@RequestBody record: ImportDataRecord) = importDataService.create(record)

    @PostMapping("/import-data/{id}")
    fun reCreate(@PathVariable("id") id: String) = importDataService.reCreate(id)

    @PostMapping("/import-data/file")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ImportDataFilerResponse =
            ImportDataFilerResponse(importDataService.uploadFile(file))

    @PatchMapping("/import-data/{id}")
    fun updateDocumentEntry(
            @PathVariable("id") id: String,
            @RequestBody record: DocumentEntryRecord
    ) = importDataService.updateDocumentEntry(id, record)

    @PatchMapping("/import-data")
    fun performImport(@RequestBody document: DocumentTypedRecord): ImportDataResult = importDataService.performImport(document)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable("id") id: String) = importDataService.delete(id)

}