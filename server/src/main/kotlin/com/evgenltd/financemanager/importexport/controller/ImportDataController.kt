package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.record.ImportDataEntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataEntryPage
import com.evgenltd.financemanager.importexport.record.ImportDataEntryUpdateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataService
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
class ImportDataController(
    private val importDataService: ImportDataService
) {

    @GetMapping("/parser/reference")
    fun parserList(): List<Reference> = importDataService.parserList()

    @GetMapping("/import-data")
    fun list(): List<ImportDataRecord> = importDataService.list()

    @PostMapping("/import-data/{id}/entry")
    fun entryList(
        @PathVariable id: String,
        @RequestBody filter: ImportDataEntryFilter
    ): ImportDataEntryPage = importDataService.entryList(id, filter)

    @GetMapping("/import-data/{id}")
    fun byId(@PathVariable id: String): ImportDataRecord = importDataService.byId(id)

    @PatchMapping("/import-data/{id}/entry")
    fun entryUpdate(
        @PathVariable("id") id: String,
        @RequestBody request: ImportDataEntryUpdateRequest
    ) = importDataService.entryUpdate(id, request)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable id: String) = importDataService.delete(id)

    @PostMapping("/import-data")
    fun startPreparation(
        @RequestParam("parser") parser: String,
        @RequestParam("account") account: String,
        @RequestParam("file") file: MultipartFile
    ) = importDataService.startPreparation(parser, account, file)

    @PatchMapping("/import-data/{id}/preparation")
    fun repeatPreparation(@PathVariable("id") id: String) = importDataService.repeatPreparation(id)

    @DeleteMapping("/import-data/{id}/preparation")
    fun cancelPreparation(@PathVariable("id") id: String) = importDataService.cancelPreparation(id)

    @PostMapping("/import-data/{id}/import")
    fun startImport(@PathVariable("id") id: String) = importDataService.startImport(id)

    @DeleteMapping("/import-data/{id}/import")
    fun cancelImport(@PathVariable("id") id: String) = importDataService.cancelImport(id)

}