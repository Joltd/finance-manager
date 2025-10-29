package com.evgenltd.financemanager.taxes.controller

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.taxes.record.NewTax
import com.evgenltd.financemanager.taxes.service.TaxService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class TaxController(
    private val taxService: TaxService,
) {

    @GetMapping("/api/v1/tax/year")
    @PreAuthorize("hasRole('USER')")
    fun yearBase(
       @RequestParam("date") date: LocalDate,
       @RequestParam("currency") currency: String,
    ): Amount = taxService.getYearBase(date, currency)

    @GetMapping("/api/v1/tax/income")
    @PreAuthorize("hasRole('USER')")
    fun income(
       @RequestParam("date") date: LocalDate,
    ): List<OperationRecord> = taxService.getIncomeForMonth(date)

    @PostMapping("/api/v1/tax")
    @PreAuthorize("hasRole('USER')")
    fun saveNewTax(@RequestBody record: NewTax) = taxService.saveNewTax(record)

}