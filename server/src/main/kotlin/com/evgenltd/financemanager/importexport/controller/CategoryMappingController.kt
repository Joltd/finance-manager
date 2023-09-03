package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.importexport.record.CategoryMappingFilter
import com.evgenltd.financemanager.importexport.record.CategoryMappingPage
import com.evgenltd.financemanager.importexport.record.CategoryMappingRecord
import com.evgenltd.financemanager.importexport.service.CategoryMappingService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class CategoryMappingController(
    private val categoryMappingService: CategoryMappingService
) {

    @PostMapping("/category-mapping/filter")
    fun list(@RequestBody filter: CategoryMappingFilter): CategoryMappingPage =
        categoryMappingService.list(filter)

    @GetMapping("/category-mapping/{id}")
    fun byId(@PathVariable("id") id: UUID): CategoryMappingRecord =
        categoryMappingService.byId(id)

    @PostMapping("/category-mapping")
    fun update(@RequestBody record: CategoryMappingRecord) = categoryMappingService.update(record)

    @DeleteMapping("/category-mapping/{id}")
    fun delete(@PathVariable("id") id: UUID) = categoryMappingService.delete(id)

}