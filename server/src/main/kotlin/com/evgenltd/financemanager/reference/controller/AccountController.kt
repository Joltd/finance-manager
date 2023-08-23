package com.evgenltd.financemanager.reference.controller

import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.service.AccountService
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class AccountController(
    private val accountService: AccountService
) {

    @GetMapping("/account/reference")
    fun listReference(
            @RequestParam("mask", required = false) mask: String?,
            @RequestParam("id", required = false) id: UUID?
    ): List<Reference> = accountService.listReference(mask, id)

    @GetMapping("/account")
    fun list(): List<AccountRecord> = accountService.list()

    @GetMapping("/account/{id}")
    fun byId(@PathVariable("id") id: UUID): AccountRecord = accountService.byId(id)

    @PostMapping("/account")
    fun update(@RequestBody record: AccountRecord) = accountService.update(record)

    @DeleteMapping("/account/{id}")
    fun delete(@PathVariable("id") id: UUID) = accountService.delete(id)

}