package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.record.AccountGroupRecord
import com.evgenltd.financemanager.account.service.AccountGroupEventService
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.service.AccountGroupService
import com.evgenltd.financemanager.common.component.SkipLogging
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
class AccountGroupController(
    private val accountGroupService: AccountGroupService,
    private val accountGroupEventService: AccountGroupEventService,
) {

    @SkipLogging
    @GetMapping("/account-group/reference")
    fun listReference(
        @RequestParam("mask", required = false) mask: String?,
        @RequestParam("id", required = false) id: UUID?,
    ): List<Reference> = accountGroupService.listReference(mask, id)

    @GetMapping("/account-group")
    fun list(): List<AccountGroupRecord> = accountGroupService.list()

    @GetMapping("/account-group/{id}")
    fun byId(@PathVariable("id") id: UUID): AccountGroupRecord = accountGroupService.byId(id)

    @PostMapping("/account-group")
    fun update(@RequestBody record: AccountGroupRecord): AccountGroupRecord = accountGroupService.update(record)
        .also { accountGroupEventService.accountGroup() }

    @DeleteMapping("/account-group/{id}")
    fun delete(@PathVariable("id") id: UUID) = accountGroupService.delete(id)
        .also { accountGroupEventService.accountGroup() }

}
