package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.CurrentFundsChartRecord
import com.evgenltd.financemanager.report.record.CurrentFundsChartSettingsRecord
import com.evgenltd.financemanager.report.service.CurrentFundsChartService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CurrentFundsChartController(
    private val currentFundsChartController: CurrentFundsChartService
) {

    @PostMapping("/current-funds-chart")
    fun load(@RequestBody settings: CurrentFundsChartSettingsRecord): CurrentFundsChartRecord = currentFundsChartController.load(settings)

}