package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.service.ExportDataService
import org.springframework.core.io.InputStreamResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.io.ByteArrayInputStream

@RestController
class ExportDataController(
        private val exportDataService: ExportDataService
) {

    @GetMapping("/export-data")
    fun download(@RequestParam("account", required = false) account: String?): ResponseEntity<Resource> {
        val result = exportDataService.performExport(account)
        val stream = ByteArrayInputStream(result)
        val file = InputStreamResource(stream)
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                .contentType(MediaType.parseMediaType("application/csv"))
                .body(file)
    }

}