package com.evgenltd.financemanager.reference.controller

import com.evgenltd.financemanager.reference.record.IncomeCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import org.springframework.web.bind.annotation.*

@RestController
class IncomeCategoryController(
        private val incomeCategoryService: IncomeCategoryService
) {

    @GetMapping("/income/reference")
    fun listReference(
            @RequestParam("mask", required = false) mask: String?,
            @RequestParam("id", required = false) id: String?
    ): List<Reference> = incomeCategoryService.listReference(mask, id)

    @GetMapping("/income")
    fun list(): List<IncomeCategoryRecord> = incomeCategoryService.list()

    @GetMapping("/income/{id}")
    fun byId(@PathVariable("id") id: String): IncomeCategoryRecord = incomeCategoryService.byId(id)

    @PostMapping("/income")
    fun update(@RequestBody record: IncomeCategoryRecord) = incomeCategoryService.update(record)

    @DeleteMapping("/income/{id}")
    fun delete(@PathVariable("id") id: String) = incomeCategoryService.delete(id)

}