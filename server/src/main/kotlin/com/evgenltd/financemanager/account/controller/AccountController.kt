package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountBalanceFilter
import com.evgenltd.financemanager.account.record.AccountBalanceGroupRecord
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.service.AccountService
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
class AccountController(
    private val accountService: AccountService,
) {

    @GetMapping("/api/v1/account/reference")
    @PreAuthorize("hasRole('USER')")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("type", required = false) type: AccountType?,
    ): List<AccountReferenceRecord> = accountService.listReference(mask, type)

    @GetMapping("/api/v1/account")
    @PreAuthorize("hasRole('USER')")
    fun list(@RequestParam("type", required = false) type: AccountType?): List<AccountRecord> = accountService.list(type)

    @GetMapping("/api/v1/account/balance")
    @PreAuthorize("hasRole('USER')")
    fun listBalance(filter: AccountBalanceFilter): List<AccountBalanceGroupRecord> = accountService.listBalances(filter)

    @GetMapping("/api/v1/account/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): AccountRecord = accountService.byId(id)

    @PostMapping("/api/v1/account")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: AccountRecord): AccountRecord = accountService.update(record)

    @DeleteMapping("/api/v1/account/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = accountService.delete(id)

}