package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.pricing.record.PricingSurveyProgress
import com.evgenltd.financemanager.pricing.record.PricingSurveyRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveySummary
import com.evgenltd.financemanager.pricing.service.PricingSurveyService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@DataResponse
class PricingSurveyController(
    private val pricingSurveyService: PricingSurveyService
) {

    @GetMapping("/api/v1/pricing/survey")
    @PreAuthorize("hasRole('USER')")
    fun list(): List<PricingSurveySummary> = pricingSurveyService.list()

    @GetMapping("/api/v1/pricing/survey/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): PricingSurveyRecord = pricingSurveyService.byId(id)

    @GetMapping("/api/v1/pricing/survey/{id}/progress")
    @PreAuthorize("hasRole('USER')")
    fun progress(@PathVariable("id") id: UUID): PricingSurveyProgress = pricingSurveyService.progress(id)

    @PostMapping("/api/v1/pricing/survey")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: PricingSurveyRecord): PricingSurveyRecord = pricingSurveyService.update(record)

    @DeleteMapping("/api/v1/pricing/survey/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = pricingSurveyService.delete(id)

}
