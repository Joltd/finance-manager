package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.DocumentIncomeRecord
import com.evgenltd.financemanager.document.service.DocumentExpenseService
import com.evgenltd.financemanager.document.service.DocumentIncomeService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DocumentIncomeController(
        private val documentIncomeService: DocumentIncomeService
) {

    @GetMapping("/document/income/{id}")
    fun byId(@PathVariable("id") id: String): DocumentIncomeRecord = documentIncomeService.byId(id)

    @PostMapping("/document/income")
    fun update(@RequestBody record: DocumentIncomeRecord) = documentIncomeService.update(record)

    @DeleteMapping("/document/income/{id}")
    fun delete(@PathVariable("id") id: String) = documentIncomeService.delete(id)
}