package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.service.CurrencyService
import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@DataResponse
@SkipLogging
class CurrencyController(
    private val currencyService: CurrencyService
) {

    @GetMapping("/api/v1/currency/reference")
    @PreAuthorize("hasRole('USER')")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = currencyService.listReference(mask, id)

    @GetMapping("/api/v1/currency")
    @PreAuthorize("hasRole('USER')")
    fun list() = currencyService.list()

    @GetMapping("/api/v1/currency/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID) = currencyService.byId(id)

    @PostMapping("/api/v1/currency")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: CurrencyRecord) = currencyService.update(record)

    @DeleteMapping("/api/v1/currency/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = currencyService.delete(id)

}