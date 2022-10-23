package com.evgenltd.financemanager.importdata.controller

import com.evgenltd.financemanager.importdata.record.ImportDataFilerResponse
import com.evgenltd.financemanager.importdata.record.ImportDataRecord
import com.evgenltd.financemanager.importdata.service.ImportDataService
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

    @PostMapping("/import-data/file")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ImportDataFilerResponse =
            ImportDataFilerResponse(importDataService.uploadFile(file))

    @PatchMapping("/import-data")
    fun performImport(@RequestBody importDataRecord: ImportDataRecord) = importDataService.performImport(importDataRecord)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable("id") id: String) = importDataService.delete(id)

}