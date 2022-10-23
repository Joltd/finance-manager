package com.evgenltd.financemanager.document.controller

import com.evgenltd.financemanager.document.record.*
import com.evgenltd.financemanager.document.service.DocumentExchangeService
import com.evgenltd.financemanager.document.service.DocumentExpenseService
import com.evgenltd.financemanager.document.service.DocumentIncomeService
import com.evgenltd.financemanager.document.service.DocumentService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DocumentController(
        private val documentService: DocumentService,
        private val documentExpenseService: DocumentExpenseService,
        private val documentIncomeService: DocumentIncomeService,
        private val documentExchangeService: DocumentExchangeService
) {

    @GetMapping("/document")
    fun list(): List<DocumentRecord> = documentService.list()

    @GetMapping("/document/{id}")
    fun byId(@PathVariable("id") id: String): DocumentTypedRecord = documentService.byId(id)

    @PostMapping("/document")
    fun update(@RequestBody record: DocumentTypedRecord) = documentService.update(record)

    @PostMapping("/document/expense")
    fun updateExpense(@RequestBody record: DocumentExpenseRecord) = documentExpenseService.update(record)

    @PostMapping("/document/income")
    fun updateIncome(@RequestBody record: DocumentIncomeRecord) = documentIncomeService.update(record)

    @PostMapping("/document/exchange")
    fun updateExchange(@RequestBody record: DocumentExchangeRecord) = documentExchangeService.update(record)

    @DeleteMapping("/document/{id}")
    fun delete(@PathVariable("id") id: String) = documentService.delete(id)

}