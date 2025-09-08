package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.report.record.TopFlowEntryRecord
import com.evgenltd.financemanager.report.record.TopFlowFilter
import com.evgenltd.financemanager.report.service.ReportService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
class ReportController(
    private val reportService: ReportService,
) {

    fun expenseIncomeChart() {}

    @GetMapping("/report/top-flow")
    fun topFlowChart(filter: TopFlowFilter): List<TopFlowEntryRecord> = reportService.topFlowChart(filter)

    fun categoryChart() {}

}