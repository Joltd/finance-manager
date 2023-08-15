package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.record.CategoryMappingFilter
import com.evgenltd.financemanager.importexport.record.CategoryMappingPage
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.importexport.service.CategoryMappingService
import org.springframework.web.bind.annotation.*

@RestController
class CategoryMappingController(
    private val categoryMappingService: CategoryMappingService
) {

    @PostMapping("/category-mapping/filter")
    fun list(@RequestBody filter: CategoryMappingFilter): CategoryMappingPage =
        categoryMappingService.list(filter)

    @GetMapping("/category-mapping/{id}")
    fun byId(@PathVariable("id") id: String): CategoryMappingRecord =
        categoryMappingService.byId(id)

    @PostMapping("/document")
    fun update(@RequestBody record: CategoryMappingRecord) = categoryMappingService.update(record)

    @DeleteMapping("/document/{id}")
    fun delete(@PathVariable("id") id: String) = categoryMappingService.delete(id)

}