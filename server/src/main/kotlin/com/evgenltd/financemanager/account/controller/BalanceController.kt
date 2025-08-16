package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.service.BalanceService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
class BalanceController(
    private val balanceService: BalanceService,
) {

    @GetMapping("/balance")
    fun list(): List<BalanceRecord> = balanceService.list()

}