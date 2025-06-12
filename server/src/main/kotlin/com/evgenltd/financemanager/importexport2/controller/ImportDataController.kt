package com.evgenltd.financemanager.importexport2.controller

import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.service.ImportDataProcessService
import com.evgenltd.financemanager.importexport2.service.ImportDataService
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
class ImportDataController(
    private val importDataService: ImportDataService,
    private val importDataProcessService: ImportDataProcessService,
) {

    @GetMapping("/import-data")
    fun list(): List<Reference> = importDataService.list()

    @GetMapping("/import-data/account")
    fun accountList(): List<Reference> = importDataService.accountList()

    @GetMapping("/import-data/{id}")
    fun get(@PathVariable id: UUID): ImportDataRecord = importDataService.get(id)

    @PostMapping("/import-data/begin")
    fun beginNewImport(@RequestPart("data") request: ImportDataCreateRequest, @RequestPart("file") file: MultipartFile): UUID {
        val importData = importDataService.save(request)
        importDataProcessService.beginNewImport(importData.id!!, file.inputStream)
        return importData.id!!
    }

}