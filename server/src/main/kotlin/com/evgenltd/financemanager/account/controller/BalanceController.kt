package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.record.BalanceRecalculationRequest
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.service.BalanceProcessService
import com.evgenltd.financemanager.account.service.BalanceService
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
@SkipLogging
class BalanceController(
    private val balanceService: BalanceService,
    private val balanceProcessService: BalanceProcessService,
) {

    @GetMapping("/api/v1/balance")
    @PreAuthorize("hasRole('USER')")
    fun list(): List<BalanceRecord> = balanceService.list()

    @PostMapping("/api/v1/balance/recalculate")
    @PreAuthorize("hasRole('USER')")
    fun recalculate(@RequestBody request: BalanceRecalculationRequest) {
        balanceProcessService.requestCalculateBalance(request.accountId, request.date)
    }

}