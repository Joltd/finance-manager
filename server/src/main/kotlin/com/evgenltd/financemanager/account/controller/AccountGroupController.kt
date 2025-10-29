package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.record.AccountGroupRecord
import com.evgenltd.financemanager.account.service.AccountGroupEventService
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.service.AccountGroupService
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
class AccountGroupController(
    private val accountGroupService: AccountGroupService,
    private val accountGroupEventService: AccountGroupEventService,
) {

    @GetMapping("/api/v1/account-group/reference")
    @PreAuthorize("hasRole('USER')")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?,
    ): List<Reference> = accountGroupService.listReference(mask, id)

    @GetMapping("/api/v1/account-group")
    @PreAuthorize("hasRole('USER')")
    fun list(): List<AccountGroupRecord> = accountGroupService.list()

    @GetMapping("/api/v1/account-group/{id}")
    @PreAuthorize("hasRole('USER')")
    fun byId(@PathVariable("id") id: UUID): AccountGroupRecord = accountGroupService.byId(id)

    @PostMapping("/api/v1/account-group")
    @PreAuthorize("hasRole('USER')")
    fun update(@RequestBody record: AccountGroupRecord): AccountGroupRecord = accountGroupService.update(record)
        .also { accountGroupEventService.accountGroup() }

    @DeleteMapping("/api/v1/account-group/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable("id") id: UUID) = accountGroupService.delete(id)
        .also { accountGroupEventService.accountGroup() }

}
