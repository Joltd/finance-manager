package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.service.PricingOrderService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class PricingOrderController(
    private val pricingOrderService: PricingOrderService
) {

    @GetMapping("/api/v1/pricing/order/defaults")
    @PreAuthorize("hasRole('USER')")
    fun loadDefaults(): PricingOrderDefaults = pricingOrderService.loadDefaults()

    @PostMapping("/api/v1/pricing/order")
    @PreAuthorize("hasRole('USER')")
    fun createOrder(@RequestBody record: PricingOrderRecord) {
        pricingOrderService.createOrder(record)
    }

}