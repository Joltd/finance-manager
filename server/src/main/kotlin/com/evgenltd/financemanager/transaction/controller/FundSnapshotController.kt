package com.evgenltd.financemanager.transaction.controller

import com.evgenltd.financemanager.transaction.record.FundSnapshotRecord
import com.evgenltd.financemanager.transaction.service.FundSnapshotService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class FundSnapshotController(
    private val fundSnapshotService: FundSnapshotService
) {

    @GetMapping("/fund-snapshot")
    fun list(): List<FundSnapshotRecord> = fundSnapshotService.list()

    @GetMapping("/fund-snapshot/{id}")
    fun byId(@PathVariable("id") id: String): FundSnapshotRecord = fundSnapshotService.byId(id)

}