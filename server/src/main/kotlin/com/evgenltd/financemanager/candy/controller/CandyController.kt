package com.evgenltd.financemanager.candy.controller

import com.evgenltd.financemanager.candy.record.CandyDashboardRecord
import com.evgenltd.financemanager.candy.record.CandyExpenseRecord
import com.evgenltd.financemanager.candy.service.CandyService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CandyController(
    private val candyService: CandyService
) {

    @GetMapping("/candy/dashboard")
    fun dashboard(): CandyDashboardRecord = candyService.dashboard()

    @PostMapping("/candy/expense")
    fun createExpense(@RequestBody record: CandyExpenseRecord) {
        candyService.createExpense(record)
    }

}