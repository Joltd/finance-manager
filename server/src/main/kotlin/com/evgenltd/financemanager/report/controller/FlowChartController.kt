package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.FlowRecord
import com.evgenltd.financemanager.report.record.FlowSettingsRecord
import com.evgenltd.financemanager.report.service.FlowChartService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class FlowChartController(
        private val flowChartService: FlowChartService
) {

    @PostMapping("/flow-chart")
    fun load(@RequestBody record: FlowSettingsRecord): FlowRecord = flowChartService.load(record)

}