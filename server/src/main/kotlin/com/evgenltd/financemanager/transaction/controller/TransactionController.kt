package com.evgenltd.financemanager.transaction.controller

import com.evgenltd.financemanager.transaction.record.Usage
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class TransactionController(
        private val transactionService: TransactionService
) {

    @GetMapping("/transaction/usage/account/{id}")
    fun usageByAccount(@PathVariable("id") id: String): Usage = transactionService.usageByAccount(id)

    @GetMapping("/transaction/usage/expense/{id}")
    fun usageByExpenseCategory(@PathVariable("id") id: String): Usage = transactionService.usageByExpenseCategory(id)

    @GetMapping("/transaction/usage/income/{id}")
    fun usageByIncomeCategory(@PathVariable("id") id: String): Usage = transactionService.usageByIncomeCategory(id)

}