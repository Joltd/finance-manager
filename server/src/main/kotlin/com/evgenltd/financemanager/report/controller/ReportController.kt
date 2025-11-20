package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.report.record.IncomeExpenseFilter
import com.evgenltd.financemanager.report.record.IncomeExpenseReportRecord
import com.evgenltd.financemanager.report.record.TopFlowFilter
import com.evgenltd.financemanager.report.record.TopFlowReportRecord
import com.evgenltd.financemanager.report.service.ReportService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
class ReportController(
    private val reportService: ReportService,
) {

    @PostMapping("/api/v1/report/top-flow")
    @PreAuthorize("hasRole('USER')")
    fun topFlowReport(@RequestBody filter: TopFlowFilter): TopFlowReportRecord = reportService.topFlowReport(filter)

    @PostMapping("/api/v1/report/income-expense")
    @PreAuthorize("hasRole('USER')")
    fun incomeExpenseReport(@RequestBody filter: IncomeExpenseFilter): IncomeExpenseReportRecord = reportService.incomeExpenseReport(filter)

}