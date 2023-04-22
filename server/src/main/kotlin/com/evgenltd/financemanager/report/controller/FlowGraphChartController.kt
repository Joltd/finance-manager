package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.FlowGraphChartRecord
import com.evgenltd.financemanager.report.service.FlowGraphChartService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class FlowGraphChartController(private val flowGraphChartService: FlowGraphChartService) {

    @GetMapping("/flow-graph-chart/{transactionId}")
    fun loadFlowGraphChart(@PathVariable transactionId: String): FlowGraphChartRecord {
        return flowGraphChartService.load(transactionId)
    }

}