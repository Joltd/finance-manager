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

    @GetMapping("/import-data")
    fun list(): List<ImportDataRecord> = importDataService.list()

    @GetMapping("/import-data/{id}")
    fun byId(@PathVariable("id") id: String): ImportDataRecord = importDataService.byId(id)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable("id") id: String) = importDataService.delete(id)

    //

    @PostMapping("/import-data/file")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ImportDataFilerResponse =
            ImportDataFilerResponse(importDataService.uploadFile(file))

    @PostMapping("/import-data")
    fun create(@RequestBody record: ImportDataRecord) = importDataService.create(record)

    @PostMapping("/import-data/{id}")
    fun reCreate(@PathVariable("id") id: String) = importDataService.reCreate(id)

    @PatchMapping("/import-data/{id}")
    fun updateDocumentEntry(
            @PathVariable("id") id: String,
            @RequestBody record: DocumentEntryRecord
    ) = importDataService.updateDocumentEntry(id, record)

    @PutMapping("/import-data/{id}")
    fun performImport(
            @PathVariable("id") id: String,
            @RequestBody documents: List<String>
    ): ImportDataResult = importDataService.performImport(id, documents)

}