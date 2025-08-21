package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.DashboardRecordOld
import com.evgenltd.financemanager.report.service.DashboardService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class DashboardController(
    private val dashboardService: DashboardService
) {
//
//    @GetMapping("/dashboard")
//    fun load(): DashboardRecordOld = dashboardService.load()

}