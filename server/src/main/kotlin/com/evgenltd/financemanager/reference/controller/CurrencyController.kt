package com.evgenltd.financemanager.reference.controller

import com.evgenltd.financemanager.reference.record.CurrencyRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.CurrencyService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class CurrencyController(
    private val currencyService: CurrencyService
) {

    @GetMapping("/currency/reference")
    fun references(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = currencyService.listReference(mask, id)

    @GetMapping("/currency")
    fun list() = currencyService.list()

    @GetMapping("/currency/{id}")
    fun byId(@PathVariable("id") id: UUID) = currencyService.byId(id)

    @PostMapping("/currency")
    fun update(@RequestBody record: CurrencyRecord) = currencyService.update(record)

    @DeleteMapping("/currency/{id}")
    fun delete(@PathVariable("id") id: UUID) = currencyService.delete(id)

}