package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.report.service.DashboardService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
class DashboardController(
    private val dashboardService: DashboardService
) {

    @GetMapping("/api/v1/dashboard")
    @PreAuthorize("hasRole('USER')")
    fun load(): DashboardRecord = dashboardService.load()

}