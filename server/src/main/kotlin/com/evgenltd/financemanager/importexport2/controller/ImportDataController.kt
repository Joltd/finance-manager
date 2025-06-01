package com.evgenltd.financemanager.importexport2.controller

import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.service.ImportDataProcessService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
class ImportDataController(
    private val importDataProcessService: ImportDataProcessService,
) {

    @PostMapping("/import-data/begin")
    fun beginNewImport(@RequestPart("data") data: ImportDataCreateRequest, @RequestPart("file") file: MultipartFile) {
        importDataProcessService.beginNewImport(data, file.inputStream)
    }

}