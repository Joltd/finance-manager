package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.report.record.CategoryChartRecord
import com.evgenltd.financemanager.report.record.CategoryChartSettingsRecord
import com.evgenltd.financemanager.report.service.CategoryChartService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CategoryChartController(
    private val categoryChartService: CategoryChartService
) {

    @PostMapping("/category-chart")
    fun load(@RequestBody record: CategoryChartSettingsRecord): CategoryChartRecord = categoryChartService.load(record)

}