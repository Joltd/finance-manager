package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.CumulativeFundsChartRecord
import com.evgenltd.financemanager.report.record.CumulativeFundsChartSettingsRecord
import com.evgenltd.financemanager.report.service.CumulativeFundsChartService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CumulativeFundsChartController(
    private val cumulativeFundsChartService: CumulativeFundsChartService
) {

    @PostMapping("/cumulative-funds-chart")
    fun load(@RequestBody record: CumulativeFundsChartSettingsRecord): CumulativeFundsChartRecord = cumulativeFundsChartService.load(record)

}