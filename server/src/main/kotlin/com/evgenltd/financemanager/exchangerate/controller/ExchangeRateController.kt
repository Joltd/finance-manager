package com.evgenltd.financemanager.exchangerate.controller

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.LocalDate

@RestController
class ExchangeRateController(
        private val exchangeRateService: ExchangeRateService
) {

    @GetMapping("/exchange-rate")
    fun list(): List<ExchangeRateRecord> = exchangeRateService.list()

    @GetMapping("/exchange-rate/{id}")
    fun byId(@PathVariable("id") id: String): ExchangeRateRecord = exchangeRateService.byId(id)

    @PostMapping("/exchange-rate")
    fun update(@RequestBody record: ExchangeRateRecord) = exchangeRateService.update(record)

    @DeleteMapping("/exchange-rate/{id}")
    fun delete(@PathVariable("id") id: String) = exchangeRateService.delete(id)

    @GetMapping("/exchange-rate/rate")
    fun rate(
        @RequestParam from: String,
        @RequestParam to: String,
    ): BigDecimal = exchangeRateService.actualRate(from, to)

}