package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.FlowGraphChartRecord
import com.evgenltd.financemanager.report.record.FlowGraphChartSettingsRecord
import com.evgenltd.financemanager.report.service.FlowGraphChartService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class FlowGraphChartController(private val flowGraphChartService: FlowGraphChartService) {

    @PostMapping("/flow-graph-chart")
    fun load(@RequestBody record: FlowGraphChartSettingsRecord): FlowGraphChartRecord = flowGraphChartService.load(record)

}