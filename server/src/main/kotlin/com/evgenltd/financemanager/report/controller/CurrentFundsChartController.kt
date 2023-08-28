package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import com.evgenltd.financemanager.report.service.CurrentFundsChartService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class CurrentFundsChartController(
    private val currentFundsChartController: CurrentFundsChartService
) {

    @GetMapping("/current-funds-chart")
    fun load(): CurrentFundsChartRecord = currentFundsChartController.load()

}