package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.service.ImportParserService
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
class ImportParserController(
    private val importParserService: ImportParserService
) {

    @SkipLogging
    @GetMapping("/parser/reference")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = importParserService.listReference(mask, id)

}
