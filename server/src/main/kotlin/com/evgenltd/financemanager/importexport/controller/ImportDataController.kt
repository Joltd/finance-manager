package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataProcessService
import com.evgenltd.financemanager.importexport.service.ImportDataService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@DataResponse
@SkipLogging
class ImportDataController(
    private val importDataService: ImportDataService,
    private val importDataProcessService: ImportDataProcessService,
    private val fileService: FileService,
) {

    @GetMapping("/api/v1/import-data")
    @PreAuthorize("hasRole('USER')")
    fun list(): List<Reference> = importDataService.list()

    @GetMapping("/api/v1/import-data/{id}")
    @PreAuthorize("hasRole('USER')")
    fun get(@PathVariable id: UUID): ImportDataRecord = importDataService.get(id)

    @PostMapping("/api/v1/import-data/begin")
    @PreAuthorize("hasRole('USER')")
    fun beginNewImport(
        @RequestPart("data") request: ImportDataCreateRequest,
        @RequestPart("file") file: MultipartFile,
    ): UUID {
        val filename = fileService.store(file)
        val importData = importDataService.save(request)
        importDataProcessService.beginNewImport(importData.id!!, filename)
        return importData.id!!
    }

    @DeleteMapping("/api/v1/import-data/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable id: UUID) = importDataProcessService.delete(id)
}
