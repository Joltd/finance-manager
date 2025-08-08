package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountBalanceFilter
import com.evgenltd.financemanager.account.record.AccountBalanceGroupRecord
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.service.AccountService
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
class AccountController(
    private val accountService: AccountService,
) {

    @GetMapping("/account/reference")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("type", required = false) type: AccountType?,
    ): List<AccountRecord> = accountService.listReference(mask, type)

    @GetMapping("/account/balance")
    fun listBalance(filter: AccountBalanceFilter): List<AccountBalanceGroupRecord> = accountService.listBalances(filter)

    @GetMapping("/account/{id}")
    fun byId(@PathVariable("id") id: UUID): AccountRecord = accountService.byId(id)

    @PostMapping("/account")
    fun update(@RequestBody record: AccountRecord): AccountRecord = accountService.update(record)

    @DeleteMapping("/account/{id}")
    fun delete(@PathVariable("id") id: UUID) = accountService.delete(id)

}