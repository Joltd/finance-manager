package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderFilter
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.service.PricingOrderService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@DataResponse
class PricingOrderController(
    private val pricingOrderService: PricingOrderService
) {

    @GetMapping("/api/v1/pricing/order/defaults")
    @PreAuthorize("hasRole('USER')")
    fun loadDefaults(): PricingOrderDefaults = pricingOrderService.loadDefaults()

    @GetMapping("/api/v1/pricing/order")
    @PreAuthorize("hasRole('USER')")
    fun list(filter: PricingOrderFilter): EntityPageResponse<PricingOrderRecord> = pricingOrderService.list(filter)

    @GetMapping("/api/v1/pricing/order/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): PricingOrderRecord = pricingOrderService.byId(id)

    @PostMapping("/api/v1/pricing/order")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: PricingOrderRecord): PricingOrderRecord = pricingOrderService.update(record)

    @DeleteMapping("/api/v1/pricing/order/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = pricingOrderService.delete(id)

    @GetMapping("/api/v1/pricing/order/country/reference")
    @PreAuthorize("hasRole('USER')")
    fun listCountryReference(@RequestParam("mask", required = false) mask: String?): List<String> =
        pricingOrderService.listDistinctCountries(mask)

    @GetMapping("/api/v1/pricing/order/city/reference")
    @PreAuthorize("hasRole('USER')")
    fun listCityReference(@RequestParam("mask", required = false) mask: String?): List<String> =
        pricingOrderService.listDistinctCities(mask)

    @GetMapping("/api/v1/pricing/order/store/reference")
    @PreAuthorize("hasRole('USER')")
    fun listStoreReference(@RequestParam("mask", required = false) mask: String?): List<String> =
        pricingOrderService.listDistinctStores(mask)

}
