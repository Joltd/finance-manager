package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.pricing.record.PricingItemFilter
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.service.PricingItemService
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
class PricingItemController(
    private val pricingItemService: PricingItemService
) {

    @GetMapping("/api/v1/pricing/item/top")
    @PreAuthorize("hasRole('USER')")
    fun search(@RequestParam query: String): List<PricingItemRecord> = pricingItemService.searchTop(query)

    @GetMapping("/api/v1/pricing/item")
    @PreAuthorize("hasRole('USER')")
    fun list(filter: PricingItemFilter): EntityPageResponse<PricingItemRecord> = pricingItemService.list(filter)

    @GetMapping("/api/v1/pricing/item/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): PricingItemRecord = pricingItemService.byId(id)

    @PostMapping("/api/v1/pricing/item")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: PricingItemRecord): PricingItemRecord = pricingItemService.update(record)

    @DeleteMapping("/api/v1/pricing/item/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = pricingItemService.delete(id)

    @GetMapping("/api/v1/pricing/item/reference")
    @PreAuthorize("hasRole('USER')")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("ids", required = false) ids: List<UUID>?,
    ): List<Reference> = pricingItemService.listReference(mask, ids)

    @GetMapping("/api/v1/pricing/item/category/reference")
    @PreAuthorize("hasRole('USER')")
    fun listCategoryReference(@RequestParam("mask", required = false) mask: String?): List<String> =
        pricingItemService.listDistinctCategories(mask)

    @GetMapping("/api/v1/pricing/item/unit/reference")
    @PreAuthorize("hasRole('USER')")
    fun listUnitReference(@RequestParam("mask", required = false) mask: String?): List<String> =
        pricingItemService.listDistinctUnits(mask)

}
