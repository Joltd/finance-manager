package com.evgenltd.financemanager.exchangerate.controller

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import org.springframework.web.bind.annotation.*
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

}