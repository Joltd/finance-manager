package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.record.ImportDataEntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataEntryPage
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
class ImportDataController(
    private val importDataService: ImportDataService
) {

    @GetMapping("/import-data")
    fun list(): List<ImportDataRecord> = importDataService.list()

    @PostMapping("/import-data/{id}/entry")
    fun entryList(
        @PathVariable("id") id: UUID,
        @RequestBody filter: ImportDataEntryFilter
    ): ImportDataEntryPage = importDataService.entryList(id, filter)

    @GetMapping("/import-data/{id}")
    fun byId(@PathVariable("id") id: UUID): ImportDataRecord = importDataService.byId(id)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable("id") id: UUID) {
        importDataService.delete(id)
    }

    @PostMapping("/import-data")
    fun preparationStart(
        @RequestParam("parser") parser: UUID,
        @RequestParam("account") account: UUID,
        @RequestParam("file") file: MultipartFile
    ) {
        importDataService.preparationStart(parser, account, file)
    }

    @PutMapping("/import-data/{id}/preparation")
    fun preparationRepeat(@PathVariable("id") id: UUID) {
        importDataService.preparationRepeat(id)
    }

    @DeleteMapping("/import-data/{id}/preparation")
    fun preparationCancel(@PathVariable("id") id: UUID) {
        importDataService.preparationCancel(id)
    }

    @PostMapping("/import-data/{id}/import")
    fun importStart(@PathVariable("id") id: UUID) {
        importDataService.importStart(id)
    }

    @DeleteMapping("/import-data/{id}/import")
    fun importCancel(@PathVariable("id") id: UUID) {
        importDataService.importCancel(id)
    }

}