package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.service.PricingItemService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class PricingItemController(
    private val pricingItemService: PricingItemService
) {

    @GetMapping("/pricing/item/top")
    fun search(@RequestParam query: String): List<PricingItemRecord> = pricingItemService.searchTop(query)

}