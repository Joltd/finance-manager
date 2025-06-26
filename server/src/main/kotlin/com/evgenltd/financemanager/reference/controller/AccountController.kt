package com.evgenltd.financemanager.reference.controller

import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountBalanceRecord
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.AccountBalanceService
import com.evgenltd.financemanager.reference.service.AccountService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
class AccountController(
    private val accountService: AccountService,
    private val accountBalanceService: AccountBalanceService,
) {

    @GetMapping("/account/reference")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?,
        @RequestParam("type", required = false) types: List<AccountType>?,
    ): List<Reference> = accountService.listReference(mask, id, types)

    @GetMapping("/account")
    fun list(): List<AccountRecord> = accountService.list()

    @GetMapping("/account/balance")
    fun balance(): List<AccountBalanceRecord> = accountBalanceService.balances()

    @GetMapping("/account/{id}")
    fun byId(@PathVariable("id") id: UUID): AccountRecord = accountService.byId(id)

    @PostMapping("/account")
    fun update(@RequestBody record: AccountRecord) = accountService.update(record)

    @DeleteMapping("/account/{id}")
    fun delete(@PathVariable("id") id: UUID) = accountService.delete(id)

}