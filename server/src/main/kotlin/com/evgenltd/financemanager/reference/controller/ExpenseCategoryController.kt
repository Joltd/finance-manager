package com.evgenltd.financemanager.reference.controller

import com.evgenltd.financemanager.reference.record.ExpenseCategoryRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import org.springframework.web.bind.annotation.*

@RestController
class ExpenseCategoryController(
        private val expenseCategoryService: ExpenseCategoryService
) {

    @GetMapping("/expense/reference")
    fun listReference(
            @RequestParam("mask", required = false) mask: String?,
            @RequestParam("id", required = false) id: String?
    ): List<Reference> = expenseCategoryService.listReference(mask, id)

    @GetMapping("/expense")
    fun list(): List<ExpenseCategoryRecord> = expenseCategoryService.list()

    @GetMapping("/expense/{id}")
    fun byId(@PathVariable("id") id: String): ExpenseCategoryRecord = expenseCategoryService.byId(id)

    @PostMapping("/expense")
    fun update(@RequestBody record: ExpenseCategoryRecord) = expenseCategoryService.update(record)

    @DeleteMapping("/expense/{id}")
    fun delete(@PathVariable("id") id: String) = expenseCategoryService.delete(id)

}