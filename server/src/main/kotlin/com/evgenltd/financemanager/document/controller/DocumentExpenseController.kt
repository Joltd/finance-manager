package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.DocumentExpenseRecord
import com.evgenltd.financemanager.document.service.DocumentExpenseService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DocumentExpenseController(
        private val documentExpenseService: DocumentExpenseService
) {

    @GetMapping("/document/expense/{id}")
    fun byId(@PathVariable("id") id: String): DocumentExpenseRecord = documentExpenseService.byId(id)

    @PostMapping("/document/expense")
    fun update(@RequestBody record: DocumentExpenseRecord) = documentExpenseService.update(record)

    @DeleteMapping("/document/expense/{id}")
    fun delete(@PathVariable("id") id: String) = documentExpenseService.delete(id)
}