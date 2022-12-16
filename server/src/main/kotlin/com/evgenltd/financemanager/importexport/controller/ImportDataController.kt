package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.record.ImportDataEntryForRemoveRecord
import com.evgenltd.financemanager.importexport.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataService
import org.springframework.web.bind.annotation.*

@RestController
class ImportDataController(
        private val importDataService: ImportDataService
) {

    @GetMapping("/import-data")
    fun list(): List<ImportDataRecord> = importDataService.list()

    @GetMapping("/import-data/{id}")
    fun byId(@PathVariable("id") id: String): ImportDataRecord = importDataService.byId(id)

    @GetMapping("/import-data/{id}/entry/{entryId}")
    fun entryById(
        @PathVariable("id") id: String,
        @PathVariable("entryId") entryId: String
    ): ImportDataEntryRecord = importDataService.entryById(id, entryId)

    @PostMapping("/import-data")
    fun update(@RequestBody record: ImportDataRecord): ImportDataRecord = importDataService.update(record)

    @PutMapping("/import-data/{id}")
    fun append(
        @PathVariable("id") id: String,
        @RequestBody entries: List<ImportDataEntryRecord>
    ) = importDataService.append(id, entries)

    @PatchMapping("/import-data/{id}/entry/{entryId}")
    fun entryUpdate(
        @PathVariable("id") id: String,
        @PathVariable("entryId") entryId: String,
        @RequestBody entry: ImportDataEntryRecord
    ) = importDataService.entryUpdate(id, entryId, entry)

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable("id") id: String) = importDataService.delete(id)

    @PostMapping("/import-data/{id}")
    fun performImport(@PathVariable("id") id: String) = importDataService.performImport(id)

}